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
import messageService from "../services/apis/messageApi";

const LAST_SEEN_KEY = (uid) => (uid ? `chat:lastSeenAt:${uid}` : null);

const toIso = (value) => {
  try {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const year = d.getUTCFullYear();
    if (year < 2000) return null;
    return d.toISOString();
  } catch {
    return null;
  }
};

const TIMESTAMP_FIELDS = [
  "createdAt",
  "createdDate",
  "dateCreated",
  "creationDate",
  "createdAtUtc",
  "sentAt",
  "sentTime",
  "messageTime",
  "messageDate",
  "timestamp",
  "time",
  "created",
];

const ensureUtcSuffix = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/(?:[zZ]|[+\-]\d{2}:\d{2})$/.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed}Z`;
  }
  return value;
};

const resolveCreatedAt = (msg) => {
  if (!msg || typeof msg !== "object") return null;
  for (const field of TIMESTAMP_FIELDS) {
    const iso = toIso(ensureUtcSuffix(msg[field]));
    if (iso) {
      return iso;
    }
  }
  return null;
};

const normalizeInboundMessage = (msg) => {
  if (!msg || typeof msg !== "object") return null;
  const senderId =
    msg.senderId ??
    msg.userId ??
    msg.fromUserId ??
    msg.ownerId ??
    msg.initiatorId ??
    null;
  const createdAt = resolveCreatedAt(msg);
  return {
    senderId: senderId ? String(senderId) : "",
    createdAt,
  };
};

const extractThreadMessages = (thread) => {
  if (!thread || typeof thread !== "object") return [];
  if (Array.isArray(thread.messages)) return thread.messages;
  if (Array.isArray(thread.chatMessages)) return thread.chatMessages;
  if (Array.isArray(thread.messageList)) return thread.messageList;
  return [];
};

const findLatestInboundTimestamp = (threads, myId) => {
  if (!Array.isArray(threads) || !threads.length) return null;
  const me = myId ? String(myId) : "";
  let latest = null;

  const consider = (iso) => {
    if (!iso) return;
    if (!latest) {
      latest = iso;
      return;
    }
    const nextMs = Date.parse(iso);
    if (Number.isNaN(nextMs)) return;
    const latestMs = Date.parse(latest);
    if (Number.isNaN(latestMs) || nextMs > latestMs) {
      latest = iso;
    }
  };

  threads.forEach((thread) => {
    const messages = extractThreadMessages(thread);
    let inboundFound = false;
    if (messages.length) {
      messages.forEach((raw) => {
        const normalized = normalizeInboundMessage(raw);
        if (
          normalized &&
          normalized.senderId &&
          (!me || normalized.senderId !== me)
        ) {
          inboundFound = true;
          consider(normalized.createdAt);
        }
      });
    }

    if (!inboundFound) {
      const summarySender =
        thread?.lastMessageSenderId ??
        thread?.lastSenderId ??
        thread?.lastMessage?.senderId ??
        thread?.latestMessage?.senderId ??
        thread?.lastMessage?.userId ??
        null;
      if (summarySender && (!me || String(summarySender) !== me)) {
        const summaryTs = toIso(
          thread?.lastMessageAt ??
            thread?.lastMessage?.createdAt ??
            thread?.latestMessage?.createdAt ??
            thread?.updatedAt ??
            thread?.lastActivity ??
            thread?.lastMessageTime
        );
        consider(summaryTs);
      }
    }
  });

  return latest;
};

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(null);
  const connectionRef = useRef(null);
  const lastSeenAtRef = useRef(null);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const shouldRaiseUnread = useCallback((incomingIso) => {
    const seen = lastSeenAtRef.current;
    if (!seen) return true;
    const incomingMs = Date.parse(incomingIso);
    const seenMs = Date.parse(seen);
    if (Number.isNaN(incomingMs) || Number.isNaN(seenMs)) return true;
    return incomingMs > seenMs;
  }, []);

  const clearUnread = useCallback(() => {
    setHasUnread(false);
    const now = new Date().toISOString();
    if (!userId) return;
    setLastSeenAt(now);
    lastSeenAtRef.current = now;
    const key = LAST_SEEN_KEY(userId);
    if (key) {
      try {
        localStorage.setItem(key, now);
      } catch (err) {
        console.warn("Failed to persist chat last seen timestamp:", err);
      }
    }
  }, [userId]);

  useEffect(() => {
    lastSeenAtRef.current = lastSeenAt;
  }, [lastSeenAt]);

  useEffect(() => {
    if (!userId) {
      setLastSeenAt(null);
      lastSeenAtRef.current = null;
      setHasUnread(false);
      return;
    }

    setHasUnread(false);
    const key = LAST_SEEN_KEY(userId);
    let stored = null;
    if (key) {
      try {
        stored = localStorage.getItem(key);
      } catch (err) {
        console.warn("Failed to read chat last seen timestamp:", err);
      }
    }
    setLastSeenAt(stored);
    lastSeenAtRef.current = stored;

    const persistLastSeen = (iso) => {
      if (!iso) return;
      setLastSeenAt(iso);
      lastSeenAtRef.current = iso;
      if (!key) return;
      try {
        localStorage.setItem(key, iso);
      } catch (err) {
        console.warn("Failed to persist chat last seen timestamp:", err);
      }
    };

    let cancelled = false;
    (async () => {
      try {
        const res = await messageService.getThreadsByUserId(userId);
        if (cancelled) return;
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const inboundTs = findLatestInboundTimestamp(list, userId);
        if (!inboundTs) return;

        const baseline = lastSeenAtRef.current;
        if (!baseline) {
          persistLastSeen(inboundTs);
          return;
        }

        if (shouldRaiseUnread(inboundTs)) {
          setHasUnread(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Unable to hydrate unread chat state:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, shouldRaiseUnread]);

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
        const normalized = normalizeInboundMessage(raw);
        const sid =
          normalized?.senderId ??
          String(
            raw?.senderId ??
              raw?.userId ??
              raw?.fromUserId ??
              raw?.ownerId ??
              ""
          );
        const me = userId ? String(userId) : "";
        if (!me || !sid || sid !== me) {
          const ts = normalized?.createdAt || new Date().toISOString();
          if (shouldRaiseUnread(ts)) {
            setHasUnread(true);
          }
        }
      } catch {
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
  }, [userId, addMessage, shouldRaiseUnread]);

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
      clearUnread,
    }),
    [
      connection,
      messages,
      addMessage,
      connectionStatus,
      isReconnecting,
      userId,
      hasUnread,
      clearUnread,
    ]
  );

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
