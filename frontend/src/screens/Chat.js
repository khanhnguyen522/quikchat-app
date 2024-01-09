import React from "react";
import OneToOneChat from "../components/OneToOneChat";
import GroupChat from "../components/GroupChat";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Chat = () => {
  const chatId = useParams().id;

  const chats = useSelector((state) => state.chat?.fetch.allChats);
  const thisChat = chats?.find(
    (chat) => chat._id.toString() === chatId.toString()
  );
  return <div>{thisChat?.isGroupChat ? <GroupChat /> : <OneToOneChat />}</div>;
};

export default Chat;
