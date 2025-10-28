import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FaLocationArrow } from "react-icons/fa";

import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { fetchChatById } from "../redux/chat/chatApiRequest";
import {
  setLatestMessageAndBump,
  setViewedAt as setViewedAtRedux,
  resetUnread,
  incrementUnread, // NEW
} from "../redux/chat/chatSlice";
import {
  getAllMessages,
  sendMessage,
} from "../redux/message/messageApiRequest";
import {
  setActiveChat,
  sendMessageSuccess as addMessageToThread,
} from "../redux/message/messageSlice";
import { getSocket } from "../lib/socket";

const nowISO = () => new Date().toISOString();
const viewedKey = (id) => `viewedAt:${id}`;

const GroupChat = () => {
  const { id: chatId } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user?.login.currentUser);
  const chats = useSelector((s) => s.chat?.fetch.allChats);
  const thisChat = chats?.find((c) => String(c?._id) === String(chatId));

  const thread = useSelector((s) => s.message.threads[chatId]);
  const serverList = thread?.items || [];

  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [optimistic, setOptimistic] = useState([]);

  const hasMsg = (id) =>
    !!serverList.find((m) => String(m?._id) === String(id));

  // capture previous viewed time for divider
  const prevViewedRef = useRef(null);

  // join room + listen for socket messages (this chat + other chats)
  useEffect(() => {
    if (!user?.accessToken || !chatId) return;
    const socket = getSocket(user.accessToken);

    if (user?._id) socket.emit("user:join", { userId: String(user._id) });
    socket.emit("chat:join", { chatId });

    const handleNewMessage = (msg) => {
      const incomingChatId = String(msg?.chat?._id || "");
      if (!incomingChatId) return;

      const isMine = String(msg?.sender?._id || "") === String(user?._id || "");

      if (incomingChatId === String(chatId)) {
        if (msg?._id && hasMsg(msg._id)) return;
        dispatch(addMessageToThread({ chatId: msg.chat._id, message: msg }));
        dispatch(
          setLatestMessageAndBump({
            chatId: msg.chat._id,
            message: msg,
            updatedAt: msg.createdAt,
          })
        );
        return;
      }

      // message for another chat: make sure it exists locally then bump + unread
      const exists = (chats || []).some(
        (c) => String(c._id) === incomingChatId
      );
      if (!exists) {
        fetchChatById(incomingChatId, dispatch, user.accessToken, axiosJWT);
      }

      if (!isMine) {
        dispatch(incrementUnread(incomingChatId));
      }

      dispatch(
        setLatestMessageAndBump({
          chatId: incomingChatId,
          message: msg,
          updatedAt: msg.createdAt,
        })
      );
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.emit("chat:leave", { chatId });
      socket.off("message:new", handleNewMessage);
    };
  }, [chatId, user?.accessToken, dispatch, user?._id, chats, axiosJWT]);

  // initial data load + viewed timestamps + unread reset
  useEffect(() => {
    if (!chatId || !user?.accessToken) return;

    // capture prev viewed first
    const prev = localStorage.getItem(viewedKey(chatId));
    prevViewedRef.current = prev ? new Date(prev).toISOString() : null;

    const at = nowISO();
    localStorage.setItem(viewedKey(chatId), at);
    dispatch(setViewedAtRedux({ chatId, at })); // optional
    dispatch(resetUnread(chatId)); // zero the badge when you open

    dispatch(setActiveChat(chatId));
    if (!thisChat) {
      fetchChatById(chatId, dispatch, user.accessToken, axiosJWT);
    }
    getAllMessages(chatId, dispatch, user.accessToken, axiosJWT);
  }, [chatId, user?.accessToken]); // eslint-disable-line

  // merge optimistic + server
  const messageList = useMemo(() => {
    const serverIds = new Set(serverList.map((m) => m._id));
    const pending = optimistic.filter((m) => !serverIds.has(m._id));
    return [...serverList, ...pending].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [serverList, optimistic]);

  const myId = String(user?._id || "");

  // divider index (first incoming after previous viewedAt)
  const prevViewedAtMs = prevViewedRef.current
    ? new Date(prevViewedRef.current).getTime()
    : 0;
  const dividerIndex = messageList.findIndex((m) => {
    const t = new Date(m.createdAt || 0).getTime();
    const senderId = String(m?.sender?._id || "");
    return senderId !== myId && t > prevViewedAtMs;
  });

  // auto scroll
  const messageEndRef = useRef(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList.length]);

  // send
  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setNewMessage("");

    const clientId = "c_" + Date.now();
    const createdAt = nowISO();
    const temp = {
      clientId,
      content,
      sender: { _id: user._id, name: user.name, pic: user.pic },
      chat: { _id: chatId },
      createdAt,
      __optimistic: true,
    };
    // mark viewed so my own message isn't counted as new
    localStorage.setItem(viewedKey(chatId), createdAt);
    dispatch(setViewedAtRedux({ chatId, at: createdAt }));
    dispatch(resetUnread(chatId));

    setOptimistic((p) => [...p, temp]);

    try {
      const saved = await sendMessage(
        { content, chatId },
        dispatch,
        user.accessToken,
        axiosJWT
      );
      setOptimistic((p) => p.filter((m) => m.clientId !== clientId));

      if (saved) {
        dispatch(
          setLatestMessageAndBump({
            chatId,
            message: saved,
            updatedAt: saved.createdAt,
          })
        );
      }
    } catch (e) {
      setOptimistic((p) => p.filter((m) => m.clientId !== clientId));
      setNewMessage(content);
      console.log(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault?.();
      handleSendMessage();
    }
  };

  if (!thisChat) {
    return <div className="p-4 text-sm text-gray-500">Loading group…</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="fixed top-0 w-full z-10 bg-white/75 ">
        <div className="flex py-2 mx-3 justify-start items-center space-x-2">
          <Link to="/chats">
            <div className="text-[rgb(134,122,245)]">
              <AiOutlineArrowLeft className="w-8 h-8" />
            </div>
          </Link>

          <Link
            to={`/chats/${chatId}/info`}
            className="flex items-center space-x-2"
          >
            <img
              src={
                thisChat?.pic ||
                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
              }
              className="w-10 h-10 rounded-full"
              alt={thisChat?.chatName || "Group"}
            />
            <div className="font-[500]">{thisChat?.chatName || "Group"}</div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="m-2 mb-16 overflow-x-hidden scroll-auto">
        <div className="flex flex-col mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80 space-y-4 mb-10">
          <div className="flex justify-center">
            <img
              src={
                thisChat?.pic ||
                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
              }
              alt="avatar"
              className="w-32 h-32 rounded-full"
            />
          </div>
        </div>

        {messageList.map((m, idx) => {
          const isMine = String(m?.sender?._id || "") === myId;

          const prev = messageList[idx - 1];
          const isSameSender =
            idx > 0 &&
            prev?.sender?._id &&
            String(prev.sender._id) === String(m?.sender?._id);

          return (
            <React.Fragment key={m._id || m.clientId}>
              {dividerIndex >= 0 && idx === dividerIndex && (
                <div className="w-full flex justify-center my-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#e9ecee] text-gray-600">
                    New messages
                  </span>
                </div>
              )}
              <div
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                } items-center space-x-2 my-1`}
              >
                {!isMine && (
                  <div className="flex max-w-[50%]">
                    {!isSameSender ? (
                      <div className="flex space-x-1 items-center">
                        <img
                          src={
                            m?.sender?.pic ||
                            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          }
                          className="w-6 h-6 rounded-full"
                          alt={m?.sender?.name || "User"}
                        />
                        <div className="p-2 rounded-3xl px-3 bg-gray-200 text-black text-sm whitespace-normal">
                          <div className="text-xs font-semibold opacity-70">
                            {m?.sender?.name || "User"}
                          </div>
                          {m?.content}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 ml-7 rounded-3xl px-3 bg-gray-200 text-black text-sm whitespace-normal">
                        {m?.content}
                      </div>
                    )}
                  </div>
                )}

                {isMine && (
                  <div className="flex max-w-[50%]">
                    <div className="p-2 rounded-3xl px-3 bg-[rgb(134,122,245)] text-white text-sm whitespace-normal">
                      {m?.content}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Composer */}
      <div className="fixed bottom-0 w-full ">
        <div className="backdrop-blur-xl bg-white/75">
          <div className="flex justify-center space-x-4 py-3 pb-4 items-center">
            <input
              className="w-9/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin text-black"
              type="text"
              placeholder="Aa"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSendMessage}
              aria-label="Send"
              disabled={isSending}
            >
              <FaLocationArrow className="w-7 h-7 text-[rgb(134,122,245)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
