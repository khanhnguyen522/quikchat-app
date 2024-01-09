import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { accessSingleChat, fetchAllChats } from "../redux/chat/chatApiRequest";

const SingleFriendComponentFromUser = ({ user }) => {
  const { _id, name, email, pic } = user;
  const loggedUser = useSelector((state) => state.user?.login.currentUser);
  const otherUser = _id;
  const accessToken = loggedUser?.accessToken;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = createAxios(loggedUser, dispatch, loginSuccess);

  // const chats = useSelector((state) => state.chat.fetch.allChats);

  const handleClickFriend = async (id) => {
    await accessSingleChat(id, dispatch, accessToken, axiosJWT, navigate);
    // await fetchAllChats(dispatch, accessToken, axiosJWT);
    // const foundChat = await chats.find(
    //   (chat) =>
    //     chat.users?.some((chatUser) => chatUser._id === otherUser) &&
    //     chat.users?.some((chatUser) => chatUser._id === loggedUser._id)
    // );
    // if (foundChat) {
    //   const chatId = foundChat._id;
    //   navigate(`/chats/${chatId}`);
    //   console.log(loggedUser._id);
    //   console.log(otherUser);
    // }
  };

  return (
    <div onClick={() => handleClickFriend(_id)}>
      <div className="w-full">
        <div className="grid grid-cols-5 text-left ">
          <div className="">
            <img className="w-14 h-14 rounded-full" src={pic} alt="ava" />
          </div>
          <div className="col-span-4 flex flex-col items-start justify-center">
            <div className="text-black font-[500]">{name}</div>
            <div className="text-black font-[400]">{email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleFriendComponentFromUser;
