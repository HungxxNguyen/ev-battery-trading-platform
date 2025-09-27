// src/pages/Chat/Chat.jsx
import React, { useMemo, useState } from "react";
import { FiSearch, FiMoreVertical, FiSend } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";

const conversationsMock = [
  {
    id: "convo-1",
    name: "Vio Store",
    lastMessage: "Hang da co san ban nhe.",
    lastActive: "3 ngay truoc",
    badgeColor: "bg-yellow-400",
    avatar:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=60",
    listing: {
      title: "Thanh ly may tap ren luyen suc khoe tai nha",
      price: "600.000 d",
      image:
        "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=300&q=60",
    },
    messages: [
      {
        id: "m1",
        author: "me",
        text: "San pham nay con khong a?",
        time: "22:50",
        status: "Da gui",
      },
      {
        id: "m2",
        author: "other",
        text: "Chao ban, con hang nhe!",
        time: "22:52",
        status: "Da doc",
      },
    ],
    quickReplies: [
      "San pham nay con khong a?",
      "Ban co ship khong?",
      "Gia cuoi la bao nhieu?",
      "Bao lau co the nhan hang?",
    ],
  },
  {
    id: "convo-2",
    name: "Minh",
    lastMessage: "San pham nay con khong a?",
    lastActive: "3 ngay truoc",
    badgeColor: "bg-blue-400",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60",
    messages: [],
  },
  {
    id: "convo-3",
    name: "Ha Ngo",
    lastMessage: "Da oke khi nao qua ban goi em nhe",
    lastActive: "3 ngay truoc",
    badgeColor: "bg-green-400",
    avatar:
      "https://images.unsplash.com/photo-1544723795-432537f00943?auto=format&fit=crop&w=200&q=60",
    messages: [],
  },
  {
    id: "convo-4",
    name: "Hua Trong Nghia",
    lastMessage: "Da vang a",
    lastActive: "3 ngay truoc",
    badgeColor: "bg-gray-400",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60",
    messages: [],
  },
];

const Chat = () => {
  const [activeConversationId, setActiveConversationId] = useState(
    conversationsMock[0]?.id
  );
  const [inputValue, setInputValue] = useState("");

  const activeConversation = useMemo(
    () => conversationsMock.find((item) => item.id === activeConversationId),
    [activeConversationId]
  );

  return (
    <MainLayout>
      <div className="bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-[330px_1fr]">
          {/* Left column */}
          <div className="border-r border-gray-100 bg-gray-50">
            <div className="px-5 pt-6 pb-4">
              <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
              <p className="text-sm text-gray-500">Trao doi nhanh voi nguoi ban</p>
              <div className="mt-4 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nhap 3 ky tu de bat dau tim kiem"
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="px-5 flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
              <span className="font-semibold text-gray-800">Tat ca tin nhan</span>
              <button className="text-blue-500 hover:text-blue-600">Tin chua doc</button>
            </div>

            <div className="mt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {conversationsMock.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition ${
                      isActive
                        ? "bg-white border-l-4 border-blue-500 shadow-sm"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${conversation.badgeColor}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {conversation.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || "Chua co tin nhan"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {conversation.lastActive}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col min-h-[520px]">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {activeConversation.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Hoat dong {activeConversation.lastActive}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    <FiMoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {activeConversation.listing && (
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <img
                      src={activeConversation.listing.image}
                      alt={activeConversation.listing.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {activeConversation.listing.title}
                      </p>
                      <p className="text-sm text-red-500 font-semibold">
                        {activeConversation.listing.price}
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-full hover:bg-green-600">
                      Chat voi nguoi ban
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
                  <div className="space-y-4">
                    {activeConversation.messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-500">
                        Bat dau cuoc tro chuyen voi nguoi ban.
                      </div>
                    ) : (
                      activeConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.author === "me"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                              message.author === "me"
                                ? "bg-yellow-100 text-gray-700"
                                : "bg-white border border-gray-200 text-gray-700"
                            }`}
                          >
                            <p className="leading-relaxed">{message.text}</p>
                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                              <span>{message.time}</span>
                              <span>|</span>
                              <span>{message.status}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {activeConversation.quickReplies?.length > 0 && (
                  <div className="px-6 py-3 border-t border-gray-100 bg-white overflow-x-auto hide-scrollbar flex gap-3">
                    {activeConversation.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm hover:bg-gray-100 whitespace-nowrap"
                        onClick={() => setInputValue(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      placeholder="Nhap tin nhan"
                      className="flex-1 min-h-[60px] max-h-32 resize-none rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                    <button className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600">
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <button className="hover:text-blue-500">Hinh va video</button>
                    <button className="hover:text-blue-500">Dia chi</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Chon mot hoi thoai de bat dau chat.
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
