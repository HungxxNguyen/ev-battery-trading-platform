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

const unwrapMessagePayload = (msg) => {
  if (!msg || typeof msg !== "object") return null;
  if (msg.payload && typeof msg.payload === "object") {
    return msg.payload;
  }
  return msg;
};

const resolveMessageIdentity = (msg, envelope = null) => {
  if (!msg || typeof msg !== "object") return null;
  const baseId =
    msg.id ??
    msg.messageId ??
    msg.chatMessageId ??
    msg._id ??
    msg.clientMessageId ??
    msg.clientTempId ??
    msg.tempId ??
    null;
  if (!baseId) return null;
  const threadId =
    msg.chatThreadId ??
    msg.threadId ??
    msg.chatThread?.id ??
    msg.conversationId ??
    (envelope && typeof envelope === "object"
      ? envelope.chatThreadId ??
        envelope.threadId ??
        envelope.chatThread?.id ??
        envelope.conversationId
      : null);
  return threadId ? `${threadId}:${baseId}` : String(baseId);
};

const MAX_TRACKED_MESSAGE_IDS = 500;

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const connectionRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());
  const seenMessageOrderRef = useRef([]);

  // Cleanup legacy chat storage keys (including any stray userId) on mount
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage || {});
      keys.forEach((k) => {
        if (
          k.startsWith("chat.threadListings") ||
          k.startsWith("chat:sentAt") ||
          k.startsWith("chat:lastSeenAt") ||
          k === "userId"
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch {
      // ignore storage access issues
    }
  }, []);

  const addMessage = useCallback((msg, envelope = null) => {
    const payload = unwrapMessagePayload(msg);
    if (!payload) return false;
    const identity = resolveMessageIdentity(payload, envelope || msg);
    if (identity) {
      const seen = seenMessageIdsRef.current;
      if (seen.has(identity)) {
        return false;
      }
      seen.add(identity);
      const order = seenMessageOrderRef.current;
      order.push(identity);
      if (order.length > MAX_TRACKED_MESSAGE_IDS) {
        const oldest = order.shift();
        if (oldest) {
          seen.delete(oldest);
        }
      }
    }
    setMessages((prev) => [...prev, payload]);
    return true;
  }, []);

  // Monitor auth state and derive userId from token without persisting to localStorage
  useEffect(() => {
    const syncUserId = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const info = decodeToken(token);
          const id = info?.userId || info?.id;
          if (id) {
            const idStr = String(id);
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

    // Respond to storage changes for token
    const handleStorageChange = (e) => {
      if (e.key === "token") {
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
      const raw = unwrapMessagePayload(msg);
      if (!raw) return;
      addMessage(raw, msg);
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
    }),
    [connection, messages, addMessage, connectionStatus, isReconnecting, userId]
  );

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
