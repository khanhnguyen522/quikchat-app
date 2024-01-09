import React from "react";
import SingleChatComponent from "./SingleChatComponent";
import avatar from "../asset/avatar.svg";
import { Link, useNavigate } from "react-router-dom";

const ChatList = ({ chats }) => {
  const navigate = useNavigate();

  const handleClickChat = (id) => {
    navigate(`/chats/${id}`);
  };

  return (
    <div className="max-h-max">
      {chats?.map((chat) => (
        <div
          key={chat._id}
          className="w-full px-4 py-2"
          onClick={() => handleClickChat(chat._id)}
        >
          <SingleChatComponent key={chat._id} chat={chat} />
        </div>
      ))}
    </div>
  );
};

export default ChatList;
