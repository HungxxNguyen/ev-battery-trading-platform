// src/contexts/MessageContext.jsx
import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import * as signalR from "@microsoft/signalr";
import axiosInstance from "../services/axiosInstance";
import { decodeToken } from "../utils/tokenUtils";

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const connectionRef = useRef(null);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Monitor auth state and derive userId from token/localStorage reliably
  useEffect(() => {
    const syncUserId = () => {
      try {
        const existing = localStorage.getItem("userId");
        if (existing) {
          if (existing !== userId) setUserId(existing);
          return;
        }

        const token = localStorage.getItem("token");
        if (token) {
          const info = decodeToken(token);
          const id = info?.userId || info?.id;
          if (id) {
            const idStr = String(id);
            localStorage.setItem("userId", idStr);
            if (idStr !== userId) setUserId(idStr);
            return;
          }
        }

        // No token or cannot decode -> ensure cleared
        if (userId !== null) setUserId(null);
      } catch (err) {
        console.error("Failed to sync userId:", err);
      }
    };

    // Run once on mount and then periodically for a short time
    syncUserId();
    const intervalId = setInterval(syncUserId, 1000);

    // Respond to storage changes for token/userId
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userId") {
        syncUserId();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userId]);

  // Create connection when userId is available
  useEffect(() => {
    if (!userId) {
      console.log("No userId available, waiting...");
      return;
    }

    // Clean up existing connection
    if (connectionRef.current) {
      console.log("Cleaning up existing connection");
      connectionRef.current.stop().catch(console.error);
      connectionRef.current = null;
      setConnection(null);
    }

    console.log("Creating SignalR connection for userId:", userId);
    const baseUrl = axiosInstance.defaults.baseURL;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/messageHub?userId=${userId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = newConnection;

    // Message handler
    newConnection.on("ReceivedMessage", (msg) => {
      console.log("Message received:", msg);
      console.log("payload received:", msg?.payload);

      if (msg?.payload) {
        addMessage(msg.payload);
      } else {
        addMessage(msg);
      }

      try {
        // Best-effort extract senderId to avoid marking our own outbound echoes as unread
        const raw = msg?.payload ? msg.payload : msg;
        const sid = String(
          raw?.senderId ?? raw?.userId ?? raw?.fromUserId ?? raw?.ownerId ?? ""
        );
        const me = userId ? String(userId) : "";
        if (!me || !sid || sid !== me) {
          setHasUnread(true);
        }
      } catch (e) {
        // Fallback: if anything goes wrong, still mark as unread
        setHasUnread(true);
      }
    });

    // Connection state handlers
    newConnection.onreconnecting((error) => {
      console.log("Connection lost. Attempting to reconnect...", error);
      setConnectionStatus("reconnecting");
      setIsReconnecting(true);
    });

    newConnection.onreconnected((connectionId) => {
      console.log(
        "Connection reestablished. Connected with connectionId",
        connectionId
      );
      setConnectionStatus("connected");
      setIsReconnecting(false);
    });

    newConnection.onclose((error) => {
      console.log("Connection permanently closed", error);
      setConnectionStatus("disconnected");
      setIsReconnecting(false);
      setConnection(null);

      // Attempt manual reconnection after automatic attempts failed
      setTimeout(() => {
        if (
          connectionRef.current &&
          connectionRef.current.state ===
            signalR.HubConnectionState.Disconnected
        ) {
          console.log("Attempting manual reconnection...");
          connectionRef.current
            .start()
            .then(() => {
              console.log("Manual reconnection successful");
              setConnection(connectionRef.current);
              setConnectionStatus("connected");
            })
            .catch((err) => {
              console.error("Manual reconnection failed:", err);
            });
        }
      }, 10000);
    });

    // Start connection
    setConnectionStatus("connecting");
    newConnection
      .start()
      .then(() => {
        console.log("MessageHub connected successfully");
        setConnection(newConnection);
        setConnectionStatus("connected");
      })
      .catch((err) => {
        console.error("Failed to connect to MessageHub:", err.message);
        setConnectionStatus("disconnected");

        // Retry connection after delay
        setTimeout(() => {
          if (connectionRef.current) {
            connectionRef.current
              .start()
              .then(() => {
                console.log("Retry connection successful");
                setConnection(connectionRef.current);
                setConnectionStatus("connected");
              })
              .catch((retryErr) => {
                console.error("Retry connection failed:", retryErr);
              });
          }
        }, 5000);
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .catch((err) => console.error("Error stopping MessageHub:", err));
        connectionRef.current = null;
      }
    };
  }, [userId, addMessage]);

  const contextValue = useMemo(
    () => ({
      connection,
      messages,
      addMessage,
      connectionStatus,
      isReconnecting,
      isConnected: connectionStatus === "connected",
      userId,
      hasUnread,
      clearUnread: () => setHasUnread(false),
    }),
    [
      connection,
      messages,
      addMessage,
      connectionStatus,
      isReconnecting,
      userId,
      hasUnread,
    ]
  );

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
