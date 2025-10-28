import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { fetchChatById } from "../redux/chat/chatApiRequest";

import OneToOneChat from "../components/OneToOneChat";
import GroupChat from "../components/GroupChat";

const Chat = () => {
  const { id: chatId } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user?.login?.currentUser);
  const chats = useSelector((s) => s.chat?.fetch?.allChats || []);
  const chat = chats.find((c) => String(c?._id) === String(chatId));

  // fetch if we don't have this chat yet
  useEffect(() => {
    if (!chatId || !user?.accessToken) return;
    if (!chat) {
      const axiosJWT = createAxios(user, dispatch, loginSuccess);
      fetchChatById(chatId, dispatch, user.accessToken, axiosJWT).catch(() => {
        // optional: you can show a toast or navigate away here
      });
    }
  }, [chatId, chat, user?.accessToken, dispatch, user]);

  // While chat isn't loaded yet, show a light placeholder instead of touching chat.isGroupChat
  if (!chat) {
    return <div className="p-4 text-sm text-gray-500">Loading chat…</div>;
  }

  // Now it's safe to branch
  return chat.isGroupChat ? <GroupChat /> : <OneToOneChat />;
};

export default Chat;
