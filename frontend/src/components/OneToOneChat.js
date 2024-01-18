import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { FaLocationArrow } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { getAllMessages } from "../redux/message/messageApiRequest";
import { accessSingleChat, fetchAllChats } from "../redux/chat/chatApiRequest";
import { sendMessage } from "../redux/message/messageApiRequest";

const OneToOneChat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatId = useParams().id;
  const user = useSelector((state) => state.user?.login.currentUser);
  const chats = useSelector((state) => state.chat?.fetch.allChats);
  const thisChat = chats?.find(
    (chat) => chat._id.toString() === chatId.toString()
  );
  const allMessages = useSelector(
    (state) => state.message.getMessages.allMessages
  );
  // console.log(thisChat?.users[1].name);
  // console.log(allMessages[0][0]?.content);

  const loggedUserId = user?._id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  // useEffect(() => {
  //   const fetchChats = async () => {
  //     try {
  //       await fetchAllChats(dispatch, user?.accessToken, axiosJWT);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   fetchChats();
  // }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        await getAllMessages(chatId, dispatch, user?.accessToken, axiosJWT);
      } catch (err) {
        console.log(err);
      }
    };
    try {
      fetchMessages();
    } catch (err) {
      console.log(err);
    }
  }, [user]);

  useEffect(() => {
    setMessages(allMessages);
  });

  let otherUserInfo = thisChat?.users?.find(
    (user) => user?._id != loggedUserId
  );

  const otherUser = {
    id: otherUserInfo?._id,
    name: otherUserInfo?.name,
    pic: otherUserInfo?.pic,
  };
  if (otherUserInfo === undefined) {
    otherUser.pic = user?.pic;
    otherUser.name = user?.name;
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      return;
    }
    const newMessageObj = {
      content: newMessage,
      chatId: chatId,
    };
    try {
      await sendMessage(newMessageObj, dispatch, user?.accessToken, axiosJWT);
      await getAllMessages(chatId, dispatch, user?.accessToken, axiosJWT);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const isOtherUserLastSender = (allMessages, curr, last) => {
    if (curr === 0) {
      return false;
    }
    if (allMessages[curr]?.sender?._id == allMessages[last]?.sender?._id) {
      return true;
    }
    return false;
  };
  //handle scroll to the bottom
  const messageEndRef = useRef();
  const scrollToBottom = () => {
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div>
      <div className=" fixed top-0 w-full z-10 bg-white/75 ">
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
            <img src={otherUser?.pic} className="w-10 h-10 rounded-full" />

            <div className="font-[500]">{otherUser?.name}</div>
          </Link>
        </div>
      </div>

      <div
        className="m-2 mb-16 overflow-x-hidden
       scroll-auto"
      >
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
        {allMessages &&
          allMessages[0]?.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.sender._id === loggedUserId
                  ? "justify-end"
                  : "justify-start"
              } items-center space-x-2 my-1`}
            >
              {message.sender._id === otherUser?.id && (
                <div className="flex  max-w-[50%]">
                  {!isOtherUserLastSender(allMessages[0], idx, idx - 1) ? (
                    <div className="flex space-x-1 items-center">
                      <img
                        src={otherUser?.pic}
                        className="w-6 h-6 rounded-full"
                        alt={otherUser?.name}
                      />
                      <div
                        className="p-2 rounded-3xl px-3 w-[100%]
                      bg-gray-200 text-black  text-sm whitespace-normal"
                      >
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-2 ml-7 rounded-3xl px-3 w-[100%]
                      bg-gray-200 text-black text-sm whitespace-normal"
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              )}
              {message.sender._id === loggedUserId && (
                <div className="flex max-w-[50%]">
                  <div className="p-2 rounded-3xl px-3 w-[100%] bg-[rgb(134,122,245)] text-white self-end text-sm whitespace-normal">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
      <div ref={messageEndRef}></div>

      <div className="fixed bottom-0 w-full ">
        <div className=" backdrop-blur-xl bg-white/75">
          <div className="flex justify-center space-x-4 py-3 pb-4 items-center">
            <input
              className="w-9/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin  text-black"
              type="text"
              placeholder="Aa"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div onClick={handleSendMessage}>
              <FaLocationArrow className="w-7 h-7 text-[rgb(134,122,245)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneToOneChat;
