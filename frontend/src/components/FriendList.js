import React from "react";
import avatar from "../asset/avatar.svg";
import { Link } from "react-router-dom";
import SingleFriendComponent from "./SingleFriendComponent";
import SingleFriendComponentFromChat from "./SingleFriendComponentFromChat";

const FriendList = ({ chats }) => {
  return (
    <div>
      {chats?.map((chat) => (
        <Link to={chat._id}>
          <div className="w-full px-4 py-2" key={chat._id}>
            <SingleFriendComponentFromChat chat={chat} />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FriendList;
