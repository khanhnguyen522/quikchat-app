import React from "react";
import { useSelector } from "react-redux";
import avatar from "../asset/avatar.svg";

const SingleChatComponent = ({ chat }) => {
  const loggedUser = useSelector((state) => state.user.login.currentUser);
  const loggedUserId = loggedUser?._id;

  // let otherUser = chat?.users?.find((user) => user._id !== loggedUserId);
  // if (otherUser === undefined) {
  //   otherUser = loggedUser;
  // }
  // const { name, pic } = otherUser;
  // const latestMessage = chat.latestMessage?.content;
  // const senderId = chat.latestMessage?.sender._id;

  let name = "";
  let pic =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  let sender = "";

  if (chat?.isGroupChat) {
    name = chat?.chatName || "Unnamed group chat";
    sender = chat?.latestMessage?.sender?.name || "";
  } else {
    let otherUser = chat?.users?.find((user) => user._id != loggedUserId);
    if (otherUser === undefined) {
      otherUser = loggedUser;
    }
    name = otherUser.name;
    pic = otherUser.pic;
  }
  const latestMessage = chat?.latestMessage?.content || "";
  const senderId = chat.latestMessage?.sender._id;

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 text-left ">
        <div className="">
          <img className="w-14 h-14 rounded-full" src={pic} alt="ava" />
        </div>
        <div className="col-span-4 mt-1">
          <div className="text-black font-[500]">{name}</div>
          <div className="overflow-y-hidden text-[#696a6a] overflow-hidden text-ellipsis whitespace-nowrap">
            {senderId === loggedUserId
              ? `You: ${latestMessage}`
              : chat?.isGroupChat && sender && latestMessage
              ? `${sender}: ${latestMessage}`
              : latestMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleChatComponent;
