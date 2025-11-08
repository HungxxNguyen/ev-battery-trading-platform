// src/pages/Chat/Chat.jsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiSend } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import messageService from "../../services/apis/messageApi";
import userService from "../../services/apis/userApi";
import { useMessages } from "../../utils/useMessages";
import { AuthContext } from "../../contexts/AuthContext";
import { currency } from "../../utils/currency";

const FALLBACK_AVATAR = "https://placehold.co/80x80?text=U";
const PIN_PREFIX = "__PINNED_LISTING__:";

const generateGuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const toIso = (value) => {
  // Normalize various date inputs to ISO string.
  // Treat missing/invalid/placeholder dates (e.g., year 1 or epoch) as "now"
  // to avoid showing 12:00 AM until the server updates the value.
  try {
    if (!value) return new Date().toISOString();
    const d = new Date(value);
    if (isNaN(d.getTime())) return new Date().toISOString();
    const year = d.getUTCFullYear();
    // Some backends return default dates like 0001-01-01T00:00:00 or 1970-01-01.
    // Consider anything earlier than 2000 as a placeholder and use current time instead.
    if (year < 2000) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const normalizeMessage = (msg) => {
  if (!msg || typeof msg !== "object") return null;
  const id = msg.id ?? msg.messageId ?? msg._id ?? null;
  const chatThreadId =
    msg.chatThreadId ??
    msg.threadId ??
    msg.chatThread?.id ??
    msg.conversationId ??
    msg.chatThreadID ??
    msg.chatId ??
    msg.chat?.id;
  const senderId = msg.senderId ?? msg.userId ?? msg.fromUserId ?? msg.ownerId;
  const messageText = msg.messageText ?? msg.message ?? msg.text ?? "";
  const createdAt = toIso(
    msg.createdAt ??
      msg.creationDate ??
      msg.createdAtUtc ??
      msg.timestamp ??
      msg.time
  );
  return {
    id,
    chatThreadId: chatThreadId ? String(chatThreadId) : "",
    senderId: senderId ? String(senderId) : "",
    messageText,
    createdAt,
  };
};

const parseThread = (t, myId) => {
  const id = String(
    t?.id ?? t?.chatThreadId ?? t?.threadId ?? t?.thread?.id ?? ""
  );
  const a = t?.userId ?? t?.userAId ?? t?.initiatorId ?? t?.ownerId;
  const b = t?.participantId ?? t?.userBId ?? t?.receiverId ?? t?.buyerId;
  let otherId = null;
  if (a && String(a) === String(myId)) otherId = b ?? null;
  else if (b && String(b) === String(myId)) otherId = a ?? null;
  if (!otherId) {
    const participants = t?.participants ?? t?.users ?? [];
    const other = participants.find(
      (p) => String(p?.id ?? p?.userId) !== String(myId)
    );
    otherId = other?.id ?? other?.userId ?? null;
  }

  const rawMessages = Array.isArray(t?.messages)
    ? t.messages
    : Array.isArray(t?.chatMessages)
    ? t.chatMessages
    : [];
  const messages = rawMessages
    .map(normalizeMessage)
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const lastActivity =
    t?.updatedAt ||
    t?.lastMessageAt ||
    (messages.length ? messages[messages.length - 1].createdAt : t?.createdAt);

  return {
    id,
    myId: String(myId),
    otherId: otherId ? String(otherId) : null,
    messages,
    lastActivity: toIso(lastActivity),
    raw: t,
  };
};

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext) || {};
  const currentUserId =
    user?.id?.toString?.() || localStorage.getItem("userId") || "";
  const participantIdFromRoute = location.state?.participantId?.toString?.();
  const listingFromRoute = location.state?.listingForChat;

  const {
    connection,
    messages: hubMessages,
    connectionStatus,
    isConnected,
  } = useMessages();

  const [threadsById, setThreadsById] = useState(new Map());
  const [threadOrder, setThreadOrder] = useState([]); // array of threadId
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [participants, setParticipants] = useState({}); // userId -> user
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingThread, setStartingThread] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fetchingThreadIds = useRef(new Set());
  const fetchingPairs = useRef(new Set());

  // Persist mapping: chatThreadId -> listing snapshot {id,title,price,thumbnail}
  const [threadListings, setThreadListings] = useState(() => {
    try {
      const raw = localStorage.getItem("chat.threadListings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "chat.threadListings",
        JSON.stringify(threadListings)
      );
    } catch {}
  }, [threadListings]);

  const toListingSummary = useCallback((l) => {
    if (!l || typeof l !== "object") return null;
    const id = l.id ?? l.listingId ?? l._id;
    if (!id) return null;
    const price =
      typeof l.price === "number" || typeof l.price === "string"
        ? l.price
        : l.priceAmount ?? undefined;
    const thumb =
      l.thumbnail ||
      l.image ||
      l.imageUrl ||
      (Array.isArray(l.images) && l.images[0]) ||
      (Array.isArray(l.listingImages) && l.listingImages[0]?.imageUrl) ||
      "https://placehold.co/80x80?text=IMG";
    return {
      id: String(id),
      title: l.title || l.name || "Tin đăng",
      price,
      thumbnail: thumb,
    };
  }, []);

  const attachListingToThread = useCallback(
    (threadId, listing) => {
      const snap = toListingSummary(listing);
      if (!threadId || !snap) return;
      setThreadListings((prev) => {
        const next = { ...prev };
        if (!next[threadId]) {
          next[threadId] = snap;
        }
        return next;
      });
    },
    [toListingSummary]
  );

  const parsePinnedListingText = useCallback(
    (text) => {
      try {
        if (!text || typeof text !== "string") return null;
        if (!text.startsWith(PIN_PREFIX)) return null;
        const payload = text.slice(PIN_PREFIX.length);
        const obj = JSON.parse(payload);
        return toListingSummary(obj);
      } catch {
        return null;
      }
    },
    [toListingSummary]
  );

  const extractPinnedFromMessages = useCallback(
    (messages) => {
      if (!Array.isArray(messages) || messages.length === 0) return null;
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const snap = parsePinnedListingText(messages[i]?.messageText);
        if (snap) return snap;
      }
      return null;
    },
    [parsePinnedListingText]
  );

  const sendPinnedListingMeta = useCallback(
    async (threadId, listing) => {
      const snap = toListingSummary(listing);
      if (!threadId || !snap || !currentUserId) return;
      const text = `${PIN_PREFIX}${JSON.stringify(snap)}`;
      try {
        await messageService.sendMessage({
          chatThreadId: threadId,
          senderId: currentUserId,
          messageText: text,
        });
      } catch {
        // ignore send failures for meta message
      }
    },
    [currentUserId, toListingSummary]
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUserId) {
      navigate("/login");
    }
  }, [currentUserId, navigate]);

  // Load threads for current user
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await messageService.getThreadsByUserId(currentUserId);
      if (cancelled) return;
      if (res?.success) {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const map = new Map();
        const order = [];
        list.forEach((t) => {
          const parsed = parseThread(t, currentUserId);
          if (!parsed.id) return;
          map.set(parsed.id, parsed);
          order.push({ id: parsed.id, ts: parsed.lastActivity });
          if (parsed.otherId) preloadUser(parsed.otherId);
        });
        order.sort((a, b) => new Date(b.ts) - new Date(a.ts));
        setThreadsById(map);
        setThreadOrder(order.map((o) => o.id));

        // If navigating from listing, ensure/select thread with that seller
        if (
          participantIdFromRoute &&
          participantIdFromRoute !== currentUserId
        ) {
          ensureThreadWith(participantIdFromRoute, map);
        } else if (order.length) {
          setSelectedThreadId(order[0].id);
        }
      } else {
        setThreadsById(new Map());
        setThreadOrder([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Prevent creating chat with self from route param
  useEffect(() => {
    if (
      participantIdFromRoute &&
      currentUserId &&
      participantIdFromRoute === currentUserId
    ) {
      console.warn("Attempt to chat with self is not allowed");
    }
  }, [participantIdFromRoute, currentUserId]);

  const ensureThreadWith = async (otherUserId, existingMap) => {
    // Prevent starting a thread with self
    if (String(otherUserId) === String(currentUserId)) {
      console.warn("Attempt to create thread with self blocked");
      return;
    }
    const entries = Array.from((existingMap || threadsById).values());
    const found = entries.find((t) => t.otherId === String(otherUserId));
    if (found) {
      setSelectedThreadId(found.id);
      preloadUser(otherUserId);
      // If we came from a listing, remember it for this thread
      if (listingFromRoute) {
        attachListingToThread(found.id, listingFromRoute);
        const foundThread = (existingMap || threadsById).get(found.id);
        const hasMeta = extractPinnedFromMessages(foundThread?.messages);
        if (!hasMeta) {
          sendPinnedListingMeta(found.id, listingFromRoute);
        }
      }
      return;
    }
    // Create thread via API
    try {
      setStartingThread(true);
      const newId = generateGuid();
      const res = await messageService.startThread({
        id: newId,
        userId: currentUserId,
        participantId: otherUserId,
      });
      const raw = res?.success ? res.data?.data ?? res.data : null;
      const parsed = parseThread(
        raw || {
          id: newId,
          userId: currentUserId,
          participantId: otherUserId,
          messages: [],
        },
        currentUserId
      );
      const id = parsed.id || newId;
      setThreadsById((prev) => {
        const next = new Map(prev);
        next.set(id, { ...parsed, id });
        return next;
      });
      setThreadOrder((prev) => [id, ...prev.filter((x) => x !== id)]);
      setSelectedThreadId(id);
      preloadUser(otherUserId);
      if (listingFromRoute) {
        attachListingToThread(id, listingFromRoute);
        // New thread has no messages yet; send meta so the seller also sees pinned
        sendPinnedListingMeta(id, listingFromRoute);
      }
    } finally {
      setStartingThread(false);
    }
  };

  const preloadUser = async (uid) => {
    if (!uid || participants[uid]) return;
    try {
      const res = await userService.getById(uid);
      const data = res?.data?.data ?? res?.data ?? null;
      if (data) setParticipants((prev) => ({ ...prev, [String(uid)]: data }));
    } catch {
      // ignore
    }
  };

  // Handle incoming hub messages
  useEffect(() => {
    if (!hubMessages?.length) return;
    const latest = hubMessages[hubMessages.length - 1];
    const normalized = normalizeMessage(latest);
    if (!normalized || !normalized.chatThreadId) return;
    const threadId = String(normalized.chatThreadId);
    const hasThread = threadsById.has(threadId);

    if (hasThread) {
      setThreadsById((prev) => {
        const thread = prev.get(threadId);
        const exists = thread.messages.some(
          (m) => m.id && normalized.id && String(m.id) === String(normalized.id)
        );
        if (exists) return prev;
        const updated = {
          ...thread,
          messages: [...thread.messages, normalized],
          lastActivity: normalized.createdAt,
        };
        const map = new Map(prev);
        map.set(threadId, updated);
        // Persist pinned listing if this is a meta message
        const snap = parsePinnedListingText(normalized.messageText);
        if (snap) {
          setThreadListings((before) => {
            if (before[threadId]) return before;
            return { ...before, [threadId]: snap };
          });
        }
        setThreadOrder((old) => [
          threadId,
          ...old.filter((x) => x !== threadId),
        ]);
        if (selectedThreadId === threadId) {
          requestAnimationFrame(scrollMessagesToBottom);
        }
        return map;
      });
    } else {
      // Thread not in local state (e.g. newly created by other side) -> fetch it
      if (fetchingThreadIds.current.has(threadId)) return;
      fetchingThreadIds.current.add(threadId);
      (async () => {
        try {
          const res = await messageService.getThreadById(threadId);
          let parsed = null;
          if (res?.success) {
            const raw = res.data?.data ?? res.data;
            parsed = parseThread(raw, currentUserId);
          }
          if (!parsed) {
            // Minimal fallback
            parsed = {
              id: threadId,
              myId: String(currentUserId),
              otherId:
                String(normalized.senderId) === String(currentUserId)
                  ? null
                  : String(normalized.senderId),
              messages: [],
              lastActivity: normalized.createdAt,
              raw: null,
            };
          }
          const finalMsg = normalized;
          setThreadsById((prev) => {
            const base = prev.get(threadId) || parsed;
            const exists = base.messages.some(
              (m) => m.id && finalMsg.id && String(m.id) === String(finalMsg.id)
            );
            const updated = exists
              ? base
              : {
                  ...base,
                  messages: [...base.messages, finalMsg],
                  lastActivity: finalMsg.createdAt,
                };
            const map = new Map(prev);
            map.set(threadId, updated);
            return map;
          });
          const snap = parsePinnedListingText(normalized.messageText);
          if (snap) {
            setThreadListings((before) => {
              if (before[threadId]) return before;
              return { ...before, [threadId]: snap };
            });
          }
          setThreadOrder((old) => [
            threadId,
            ...old.filter((x) => x !== threadId),
          ]);
          if (parsed.otherId) preloadUser(parsed.otherId);
        } finally {
          fetchingThreadIds.current.delete(threadId);
        }
      })();
    }
  }, [hubMessages, selectedThreadId, threadsById, currentUserId]);

  // Handle incoming hub messages without thread id (infer via senderId)
  useEffect(() => {
    if (!hubMessages?.length) return;
    const latest = hubMessages[hubMessages.length - 1];
    const normalized = normalizeMessage(latest);
    if (!normalized || normalized.chatThreadId) return; // handled in other effect
    const senderId = normalized.senderId;
    if (!senderId) return;
    // Ignore our own outbound messages without thread id to avoid creating self-threads
    if (String(senderId) === String(currentUserId)) return;

    // Try to find existing thread with this sender
    const existing = Array.from(threadsById.values()).find(
      (t) => String(t.otherId) === String(senderId)
    );

    if (existing) {
      const threadId = existing.id;
      setThreadsById((prev) => {
        const thread = prev.get(threadId);
        const exists = thread.messages.some(
          (m) => m.id && normalized.id && String(m.id) === String(normalized.id)
        );
        if (exists) return prev;
        const updated = {
          ...thread,
          messages: [...thread.messages, normalized],
          lastActivity: normalized.createdAt,
        };
        const map = new Map(prev);
        map.set(threadId, updated);
        return map;
      });
      const snap = parsePinnedListingText(normalized.messageText);
      if (snap) {
        setThreadListings((before) => {
          if (before[threadId]) return before;
          return { ...before, [threadId]: snap };
        });
      }
      setThreadOrder((old) => [
        existing.id,
        ...old.filter((x) => x !== existing.id),
      ]);
      if (selectedThreadId === existing.id) {
        requestAnimationFrame(scrollMessagesToBottom);
      }
      return;
    }

    // Fetch threads for current user and locate the matching thread
    const key = `${currentUserId}:${senderId}`;
    if (fetchingPairs.current.has(key)) return;
    fetchingPairs.current.add(key);
    (async () => {
      try {
        const res = await messageService.getThreadsByUserId(currentUserId);
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        let matched = null;
        for (const t of list) {
          const parsed = parseThread(t, currentUserId);
          if (parsed.otherId && String(parsed.otherId) === String(senderId)) {
            matched = parsed;
            break;
          }
        }

        if (matched) {
          const threadId = matched.id;
          setThreadsById((prev) => {
            const base = prev.get(threadId) || matched;
            const exists = base.messages.some(
              (m) =>
                m.id && normalized.id && String(m.id) === String(normalized.id)
            );
            const updated = exists
              ? base
              : {
                  ...base,
                  messages: [...base.messages, normalized],
                  lastActivity: normalized.createdAt,
                };
            const map = new Map(prev);
            map.set(threadId, updated);
            return map;
          });
          const snap = parsePinnedListingText(normalized.messageText);
          if (snap) {
            setThreadListings((before) => {
              if (before[threadId]) return before;
              return { ...before, [threadId]: snap };
            });
          }
          setThreadOrder((old) => [
            threadId,
            ...old.filter((x) => x !== threadId),
          ]);
          if (matched.otherId) preloadUser(matched.otherId);
          if (selectedThreadId === threadId) {
            requestAnimationFrame(scrollMessagesToBottom);
          }
        } else {
          // As a last resort, create a transient local thread to display
          const threadId = `pair-${senderId}`;
          const transient = {
            id: threadId,
            myId: String(currentUserId),
            otherId: String(senderId),
            messages: [],
            lastActivity: normalized.createdAt,
            raw: null,
          };
          setThreadsById((prev) => {
            const base = prev.get(threadId) || transient;
            const updated = {
              ...base,
              messages: [...base.messages, normalized],
              lastActivity: normalized.createdAt,
            };
            const map = new Map(prev);
            map.set(threadId, updated);
            return map;
          });
          setThreadOrder((old) => [
            threadId,
            ...old.filter((x) => x !== threadId),
          ]);
          preloadUser(senderId);
        }
      } finally {
        fetchingPairs.current.delete(key);
      }
    })();
  }, [hubMessages, threadsById, currentUserId, selectedThreadId]);

  // Join selected thread group on the hub (if server supports groups)
  useEffect(() => {
    if (connection && isConnected && selectedThreadId) {
      try {
        connection.invoke("JoinThread", selectedThreadId).catch((err) => {
          console.warn("JoinThread failed:", err?.message || err);
        });
      } catch (e) {
        console.warn("JoinThread threw:", e?.message || e);
      }
    }
  }, [connection, isConnected, selectedThreadId]);

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threadsById.get(selectedThreadId) || null;
  }, [threadsById, selectedThreadId]);

  // Backfill pinned listing cache if a meta message exists in the selected thread
  useEffect(() => {
    if (!selectedThread?.id) return;
    if (threadListings[selectedThread.id]) return;
    const snap = extractPinnedFromMessages(selectedThread.messages);
    if (snap) {
      setThreadListings((prev) => ({ ...prev, [selectedThread.id]: snap }));
    }
  }, [selectedThread, threadListings, extractPinnedFromMessages]);

  const filteredThreadOrder = useMemo(() => {
    if (!search.trim()) return threadOrder;
    const term = search.toLowerCase();
    return threadOrder.filter((tid) => {
      const t = threadsById.get(tid);
      const other = t?.otherId && participants[t.otherId];
      const name = (
        other?.userName ||
        other?.name ||
        `User ${t?.otherId || ""}`
      ).toLowerCase();
      const lastMsg =
        t?.messages?.[t.messages.length - 1]?.messageText?.toLowerCase?.() ||
        "";
      return name.includes(term) || lastMsg.includes(term);
    });
  }, [threadOrder, threadsById, participants, search]);

  const scrollMessagesToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, []);

  // Auto-scroll to bottom when switching threads or when messages in the selected thread load
  useEffect(() => {
    if (!selectedThreadId) return;
    const timer = setTimeout(() => {
      requestAnimationFrame(scrollMessagesToBottom);
    }, 0);
    return () => clearTimeout(timer);
  }, [
    selectedThreadId,
    selectedThread?.messages?.length,
    scrollMessagesToBottom,
  ]);

  const getAvatarUrl = useCallback(
    (uid) => {
      if (!uid) return FALLBACK_AVATAR;
      if (String(uid) === String(currentUserId)) {
        return user?.thumbnail || user?.avatar || FALLBACK_AVATAR;
      }
      const p =
        participants[String(uid)] ||
        (selectedThread?.otherId && participants[selectedThread.otherId]);
      return p?.thumbnail || p?.avatar || FALLBACK_AVATAR;
    },
    [currentUserId, participants, selectedThread, user]
  );

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !selectedThread) return;
    setInputValue("");
    const payload = {
      chatThreadId: selectedThread.id,
      senderId: currentUserId,
      messageText: text,
    };
    try {
      const res = await messageService.sendMessage(payload);
      const serverMsg = res?.data?.data ?? res?.data ?? null;
      const normalized = normalizeMessage(serverMsg) || {
        id: serverMsg?.id || `local-${Date.now()}`,
        chatThreadId: String(selectedThread.id),
        senderId: String(currentUserId),
        messageText: text,
        createdAt: new Date().toISOString(),
      };
      setThreadsById((prev) => {
        const t = prev.get(selectedThread.id);
        if (!t) return prev;
        const updated = {
          ...t,
          messages: [...t.messages, normalized],
          lastActivity: normalized.createdAt,
        };
        const map = new Map(prev);
        map.set(selectedThread.id, updated);
        return map;
      });
      requestAnimationFrame(scrollMessagesToBottom);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  // Online/offline UI removed per request

  return (
    <MainLayout hideFooter>
      <div className="bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[330px_1fr]">
          {/* Left column */}
          <div className="border-r border-gray-100 bg-gray-50">
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
                  <p className="text-sm text-gray-500">
                    Trao đổi nhanh với người bạn
                  </p>
                </div>
                {/* status removed */}
              </div>
              <div className="mt-4 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập 3 ký tự để bắt đầu tìm kiếm"
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="px-5 flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
              <span className="font-semibold text-gray-800">
                Tất cả tin nhắn
              </span>
            </div>

            <div className="mt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-128px)] pr-1">
              {loading && (
                <div className="px-5 py-3 text-sm text-gray-500">
                  Đang tải danh sách chat...
                </div>
              )}
              {!loading && filteredThreadOrder.length === 0 && (
                <div className="px-5 py-3 text-sm text-gray-500">
                  Chưa có cuộc trò chuyện nào
                </div>
              )}
              {filteredThreadOrder.map((tid) => {
                const t = threadsById.get(tid);
                const other = t?.otherId && participants[t.otherId];
                const name =
                  other?.userName || other?.name || `User ${t?.otherId || ""}`;
                const avatar =
                  other?.thumbnail || other?.avatar || FALLBACK_AVATAR;
                const last =
                  t?.messages?.[t.messages.length - 1]?.messageText || "";
                const isActive = selectedThreadId === tid;
                return (
                  <button
                    key={tid}
                    onClick={() => setSelectedThreadId(tid)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition cursor-pointer ${
                      isActive
                        ? "bg-white border-l-4 border-blue-500 shadow-sm"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {/* online dot removed */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {last || "Chưa có tin nhắn"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col h-[calc(100vh-128px)]">
            {selectedThread ? (
              <>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        (selectedThread.otherId &&
                          participants[selectedThread.otherId]?.thumbnail) ||
                        FALLBACK_AVATAR
                      }
                      alt={
                        (selectedThread.otherId &&
                          participants[selectedThread.otherId]?.userName) ||
                        "User"
                      }
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {(selectedThread.otherId &&
                          participants[selectedThread.otherId]?.userName) ||
                          (selectedThread.otherId
                            ? `User ${selectedThread.otherId}`
                            : "")}
                      </p>
                      {/* online text removed */}
                    </div>
                  </div>
                </div>

                {/* Pinned listing banner */}
                {(() => {
                  const pinned = (() => {
                    if (!selectedThread) return null;
                    const fromCache = threadListings[selectedThread.id];
                    if (fromCache) return fromCache;
                    const fromMessages = extractPinnedFromMessages(
                      selectedThread.messages
                    );
                    if (fromMessages) return fromMessages;
                    if (
                      listingFromRoute &&
                      participantIdFromRoute &&
                      selectedThread.otherId &&
                      String(selectedThread.otherId) ===
                        String(participantIdFromRoute)
                    ) {
                      return toListingSummary(listingFromRoute);
                    }
                    return null;
                  })();
                  if (!pinned) return null;
                  return (
                    <div className="px-6 py-3 bg-white border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => navigate(`/listing/${pinned.id}`)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <img
                            src={
                              pinned.thumbnail ||
                              "https://placehold.co/80x80?text=IMG"
                            }
                            alt={pinned.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 truncate">
                              {pinned.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {typeof pinned.price === "number"
                                ? currency(pinned.price)
                                : pinned.price || ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })()}

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50"
                >
                  <div className="space-y-4">
                    {selectedThread.messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-500">
                        Bắt đầu cuộc trò chuyện với người bạn.
                      </div>
                    ) : (
                      selectedThread.messages
                        .filter((m) => !parsePinnedListingText(m?.messageText))
                        .map((m, idx, arr) => {
                          const isMe =
                            String(m.senderId) === String(currentUserId);
                          const next = arr[idx + 1];
                          const lastInGroup =
                            !next ||
                            String(next.senderId) !== String(m.senderId);
                          const showAvatar = lastInGroup;
                          const avatarUrl = getAvatarUrl(m.senderId);
                          const altText = isMe
                            ? user?.userName || user?.name || "Me"
                            : participants[selectedThread.otherId]?.userName ||
                              participants[selectedThread.otherId]?.name ||
                              "User";
                          return (
                            <div
                              key={m.id || `${m.createdAt}-${m.senderId}`}
                              className={`flex items-end gap-2 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isMe &&
                                (showAvatar ? (
                                  <img
                                    src={avatarUrl}
                                    alt={altText}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-7 h-7" />
                                ))}
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                  isMe
                                    ? "bg-blue-50 text-gray-800"
                                    : "bg-white border border-gray-200 text-gray-800"
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap break-words">
                                  {m.messageText}
                                </p>
                                <div className="mt-2 text-xs text-gray-400">
                                  {new Date(m.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </div>
                              {/* No avatar for right side (me) */}
                            </div>
                          );
                        })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Nhập tin nhắn"
                      className="flex-1 min-h-[60px] max-h-32 resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button
                      onClick={handleSend}
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
                      disabled={!inputValue.trim()}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                {startingThread
                  ? "Đang tạo cuộc trò chuyện..."
                  : "Chọn một hội thoại để bắt đầu chat."}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
