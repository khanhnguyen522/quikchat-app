// pages/Chat.jsx
import React, { useEffect } from "react";
import OneToOneChat from "../components/OneToOneChat";
import GroupChat from "../components/GroupChat";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChatById } from "../redux/chat/chatApiRequest";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";

const Chat = () => {
  const { id: chatId } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user?.login.currentUser);
  const chats = useSelector((s) => s.chat?.fetch.allChats);
  const thisChat = chats?.find(
    (c) => c?._id?.toString() === chatId?.toString()
  );

  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (!thisChat && chatId && user?.accessToken) {
      fetchChatById(chatId, dispatch, user.accessToken, axiosJWT);
    }
  }, [thisChat, chatId, user?.accessToken]);

  return <div>{thisChat.isGroupChat ? <GroupChat /> : <OneToOneChat />}</div>;
};

export default Chat;
