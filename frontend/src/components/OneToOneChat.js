import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FaLocationArrow } from "react-icons/fa";

import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { fetchChatById } from "../redux/chat/chatApiRequest";
import {
  setLatestMessageAndBump,
  removeChatById,
  setViewedAt as setViewedAtRedux,
  resetUnread,
  incrementUnread, // NEW: for other chats while you’re inside this one
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

const OneToOneChat = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
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

  // capture the last viewedAt BEFORE we update it (used for divider)
  const prevViewedRef = useRef(null);

  // if you don't belong here anymore, bounce
  useEffect(() => {
    if (!thisChat || !user?._id) return;
    const inChat = (thisChat.users || []).some(
      (u) => String(u?._id) === String(user._id)
    );
    if (!inChat) {
      dispatch(removeChatById(chatId));
      navigate("/chats");
    }
  }, [thisChat, user?._id, chatId, dispatch, navigate]);

  // socket: join room + receive (covers this chat AND other chats)
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
        // message for THIS chat
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

      // message belongs to ANOTHER chat (you’re currently inside this one)
      // ensure that other chat exists locally; if not, fetch once
      const exists = (chats || []).some(
        (c) => String(c._id) === incomingChatId
      );
      if (!exists) {
        fetchChatById(incomingChatId, dispatch, user.accessToken, axiosJWT);
      }

      // increment unread for that other chat if it isn't your own message
      if (!isMine) {
        dispatch(incrementUnread(incomingChatId));
      }

      // keep list’s preview/order fresh
      dispatch(
        setLatestMessageAndBump({
          chatId: incomingChatId,
          message: msg,
          updatedAt: msg.createdAt,
        })
      );
    };

    const handleChatRemoved = ({ chatId: removedId }) => {
      if (String(removedId) !== String(chatId)) return;
      socket.emit("chat:leave", { chatId });
      dispatch(removeChatById(chatId));
      navigate("/chats");
    };

    socket.on("message:new", handleNewMessage);
    socket.on("chat:removed", handleChatRemoved);

    return () => {
      socket.emit("chat:leave", { chatId });
      socket.off("message:new", handleNewMessage);
      socket.off("chat:removed", handleChatRemoved);
    };
  }, [
    chatId,
    user?.accessToken,
    user?._id,
    chats,
    dispatch,
    navigate,
    axiosJWT,
  ]);

  // fetch on entry + manage viewedAt & unread reset
  useEffect(() => {
    if (!chatId || !user?.accessToken) return;

    // capture previous viewedAt before overwriting it (for divider)
    const prev = localStorage.getItem(viewedKey(chatId));
    prevViewedRef.current = prev ? new Date(prev).toISOString() : null;

    // mark viewed NOW (so unread resets immediately when you open the chat)
    const at = nowISO();
    localStorage.setItem(viewedKey(chatId), at);
    dispatch(setViewedAtRedux({ chatId, at }));
    dispatch(resetUnread(chatId));

    dispatch(setActiveChat(chatId));

    if (!thisChat) {
      fetchChatById(chatId, dispatch, user.accessToken, axiosJWT).catch(
        (err) => {
          const status = err?.response?.status;
          if (status === 403 || status === 404) {
            dispatch(removeChatById(chatId));
            navigate("/chats");
          }
        }
      );
    }

    getAllMessages(chatId, dispatch, user.accessToken, axiosJWT).catch(
      (err) => {
        const status = err?.response?.status;
        if (status === 403 || status === 404) {
          dispatch(removeChatById(chatId));
          navigate("/chats");
        }
      }
    );
  }, [chatId, user?.accessToken]); // eslint-disable-line

  // merge optimistic + server
  const messageList = useMemo(() => {
    const serverIds = new Set(serverList.map((m) => m._id));
    const pending = optimistic.filter((m) => !serverIds.has(m._id));
    return [...serverList, ...pending].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [serverList, optimistic]);

  // peer info
  const myId = String(user?._id || "");
  const participants = Array.isArray(thisChat?.users)
    ? thisChat.users
    : Array.isArray(messageList?.[0]?.chat?.users)
    ? messageList[0].chat.users
    : [];

  const participantIds = participants.map((u) =>
    String(typeof u === "string" ? u : u?._id || "")
  );
  const otherId = participantIds.find((id) => id && id !== myId) || "";
  const otherUserInfo =
    participants.find(
      (u) => String(typeof u === "string" ? u : u?._id || "") === otherId
    ) || {};
  const otherUser = {
    id: otherId,
    name: otherUserInfo?.name || "Unknown",
    pic:
      otherUserInfo?.pic ||
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  };

  // divider (first incoming after prev viewed)
  const prevViewedAtMs = prevViewedRef.current
    ? new Date(prevViewedRef.current).getTime()
    : 0;
  const dividerIndex = messageList.findIndex((m) => {
    const t = new Date(m.createdAt || 0).getTime();
    const senderId = String(m?.sender?._id || "");
    return senderId !== myId && t > prevViewedAtMs;
  });

  // scroll
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
      chat: { _id: chatId, users: thisChat?.users || [] },
      createdAt,
      __optimistic: true,
    };

    // mark as viewed immediately so my message isn't "new"
    localStorage.setItem(viewedKey(chatId), createdAt);
    dispatch(setViewedAtRedux({ chatId, at: createdAt }));
    dispatch(resetUnread(chatId)); // keep badge at 0 while you type

    setOptimistic((p) => [...p, temp]);
    dispatch(
      setLatestMessageAndBump({
        chatId,
        message: temp,
        updatedAt: createdAt,
      })
    );

    try {
      const saved = await sendMessage(
        { content, chatId },
        undefined,
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
    return <div className="p-4 text-sm text-gray-500">Loading chat…</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="fixed top-0 w-full z-10 bg-white/75">
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
              src={otherUser.pic}
              className="w-10 h-10 rounded-full"
              alt={otherUser.name}
            />
            <div className="font-[500]">{otherUser.name}</div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="m-2 mb-16 overflow-x-hidden scroll-auto">
        <div className="flex flex-col mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80 space-y-4 mb-10">
          <div className="flex justify-center">
            <img
              src={otherUser.pic}
              alt="avatar"
              className="w-32 h-32 rounded-full"
            />
          </div>
          <div className="flex justify-center text-2xl font-[600]">
            {otherUser.name}
          </div>
          <div className="flex text-center text-[#6c7175]">
            Both of you can now engage in a conversation with each other
          </div>
        </div>

        {messageList.map((m, idx) => {
          const senderId = String(m?.sender?._id || "");
          const isMine = senderId === myId;
          const prevSenderId = String(
            messageList?.[idx - 1]?.sender?._id || ""
          );
          const isPrevSame = idx > 0 && prevSenderId === senderId;

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
                    {!isPrevSame ? (
                      <div className="flex space-x-1 items-center">
                        <img
                          src={otherUser.pic}
                          className="w-6 h-6 rounded-full"
                          alt={otherUser.name}
                        />
                        <div className="p-2 rounded-3xl px-3 w-[100%] bg-gray-200 text-black text-sm whitespace-normal">
                          {m?.content}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 ml-7 rounded-3xl px-3 w-[100%] bg-gray-200 text-black text-sm whitespace-normal">
                        {m?.content}
                      </div>
                    )}
                  </div>
                )}

                {isMine && (
                  <div className="flex max-w-[50%]">
                    <div className="p-2 rounded-3xl px-3 w-[100%] bg-[rgb(134,122,245)] text-white self-end text-sm whitespace-normal">
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
      <div className="fixed bottom-0 w-full">
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

export default OneToOneChat;
