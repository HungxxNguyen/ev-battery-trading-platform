// src/pages/Chat/Chat.jsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiSend } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import messageService from "../../services/apis/messageApi";
import userService from "../../services/apis/userApi";
import { useMessages } from "../../utils/useMessages";
import { AuthContext } from "../../contexts/AuthContext";

const FALLBACK_AVATAR = "https://placehold.co/80x80?text=U";

const generateGuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const toIso = (value) => {
  if (!value) return new Date().toISOString();
  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
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
  const fetchingThreadIds = useRef(new Set());
  const fetchingPairs = useRef(new Set());

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
    const entries = Array.from((existingMap || threadsById).values());
    const found = entries.find((t) => t.otherId === String(otherUserId));
    if (found) {
      setSelectedThreadId(found.id);
      preloadUser(otherUserId);
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
        raw || { id: newId, userId: currentUserId, participantId: otherUserId, messages: [] },
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
        setThreadOrder((old) => [threadId, ...old.filter((x) => x !== threadId)]);
        if (selectedThreadId === threadId) {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          });
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
          setThreadOrder((old) => [threadId, ...old.filter((x) => x !== threadId)]);
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
      setThreadOrder((old) => [existing.id, ...old.filter((x) => x !== existing.id)]);
      if (selectedThreadId === existing.id) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
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
              (m) => m.id && normalized.id && String(m.id) === String(normalized.id)
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
          setThreadOrder((old) => [threadId, ...old.filter((x) => x !== threadId)]);
          if (matched.otherId) preloadUser(matched.otherId);
          if (selectedThreadId === threadId) {
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
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
          setThreadOrder((old) => [threadId, ...old.filter((x) => x !== threadId)]);
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

  const filteredThreadOrder = useMemo(() => {
    if (!search.trim()) return threadOrder;
    const term = search.toLowerCase();
    return threadOrder.filter((tid) => {
      const t = threadsById.get(tid);
      const other = t?.otherId && participants[t.otherId];
      const name = (other?.userName || other?.name || `User ${t?.otherId || ""}`).toLowerCase();
      const lastMsg = t?.messages?.[t.messages.length - 1]?.messageText?.toLowerCase?.() || "";
      return name.includes(term) || lastMsg.includes(term);
    });
  }, [threadOrder, threadsById, participants, search]);

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
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const statusBadge = (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        isConnected
          ? "bg-green-50 text-green-700 border border-green-200"
          : connectionStatus === "connecting"
          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
          : "bg-gray-50 text-gray-600 border border-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isConnected
            ? "bg-green-500"
            : connectionStatus === "connecting"
            ? "bg-yellow-500"
            : "bg-gray-400"
        }`}
      />
      {isConnected
        ? "Truc tuyen"
        : connectionStatus === "connecting"
        ? "Dang ket noi..."
        : "Ngoai tuyen"}
    </span>
  );

  return (
    <MainLayout>
      <div className="bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[330px_1fr]">
          {/* Left column */}
          <div className="border-r border-gray-100 bg-gray-50">
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
                  <p className="text-sm text-gray-500">Trao doi nhanh voi nguoi ban</p>
                </div>
                {statusBadge}
              </div>
              <div className="mt-4 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhap 3 ky tu de bat dau tim kiem"
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="px-5 flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
              <span className="font-semibold text-gray-800">Tat ca tin nhan</span>
            </div>

            <div className="mt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {loading && (
                <div className="px-5 py-3 text-sm text-gray-500">Dang tai danh sach chat...</div>
              )}
              {!loading && filteredThreadOrder.length === 0 && (
                <div className="px-5 py-3 text-sm text-gray-500">Chua co cuoc tro chuyen nao</div>
              )}
              {filteredThreadOrder.map((tid) => {
                const t = threadsById.get(tid);
                const other = t?.otherId && participants[t.otherId];
                const name = other?.userName || other?.name || `User ${t?.otherId || ""}`;
                const avatar = other?.thumbnail || other?.avatar || FALLBACK_AVATAR;
                const last = t?.messages?.[t.messages.length - 1]?.messageText || "";
                const isActive = selectedThreadId === tid;
                return (
                  <button
                    key={tid}
                    onClick={() => setSelectedThreadId(tid)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition ${
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
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        isConnected ? "bg-green-400" : "bg-gray-300"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-sm text-gray-500 truncate">{last || "Chua co tin nhan"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col min-h-[520px]">
            {selectedThread ? (
              <>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        (selectedThread.otherId && participants[selectedThread.otherId]?.thumbnail) ||
                        FALLBACK_AVATAR
                      }
                      alt={
                        (selectedThread.otherId && participants[selectedThread.otherId]?.userName) ||
                        "User"
                      }
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {(selectedThread.otherId && participants[selectedThread.otherId]?.userName) ||
                          (selectedThread.otherId ? `User ${selectedThread.otherId}` : "")}
                      </p>
                      <p className="text-xs text-gray-500">{isConnected ? "Dang truc tuyen" : "Ngoai tuyen"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
                  <div className="space-y-4">
                    {selectedThread.messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-500">
                        Bat dau cuoc tro chuyen voi nguoi ban.
                      </div>
                    ) : (
                      selectedThread.messages.map((m) => {
                        const isMe = String(m.senderId) === String(currentUserId);
                        return (
                          <div key={m.id || `${m.createdAt}-${m.senderId}`} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                              isMe ? "bg-blue-50 text-gray-800" : "bg-white border border-gray-200 text-gray-800"
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap break-words">{m.messageText}</p>
                              <div className="mt-2 text-xs text-gray-400">
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
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
                      placeholder="Nhap tin nhan"
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
                      className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
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
                  ? "Dang tao cuoc tro chuyen..."
                  : "Chon mot hoi thoai de bat dau chat."}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
