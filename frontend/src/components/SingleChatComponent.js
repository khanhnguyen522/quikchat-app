import React from "react";
import { useSelector } from "react-redux";

const SingleChatComponent = ({ chat }) => {
  const loggedUser = useSelector((state) => state.user.login.currentUser);
  const loggedUserId = loggedUser?._id;
  const unreadCounts = useSelector((s) => s.chat.unreadCounts) || {};

  if (!chat) return null; // prevent crash if chat is temporarily undefined

  const unread = unreadCounts?.[String(chat._id)] ?? 0;

  let name = "";
  let pic =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  let sender = "";
  const latestMessage = chat?.latestMessage?.content || "";
  const senderId = chat?.latestMessage?.sender?._id;

  if (chat?.isGroupChat) {
    name = chat?.chatName || "Unnamed group chat";
    sender = chat?.latestMessage?.sender?.name || "";
  } else {
    const otherUser =
      chat?.users?.find((u) => String(u?._id) !== String(loggedUserId)) ||
      loggedUser;
    name = otherUser?.name || "Unknown";
    pic = otherUser?.pic || pic;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 text-left items-center">
        <div className="relative">
          <img className="w-14 h-14 rounded-full" src={pic} alt="ava" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 text-xs leading-none px-1.5 py-1 rounded-full bg-[rgb(134,122,245)] text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
        <div className="col-span-4 mt-1">
          <div className="text-black font-[500] flex items-center gap-2">
            <span>{name}</span>
            {unread > 0 && (
              <span className="text-[10px] uppercase tracking-wide text-[rgb(134,122,245)] bg-[rgb(134,122,245,0.1)] rounded px-1 py-[1px]">
                unread
              </span>
            )}
          </div>
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
