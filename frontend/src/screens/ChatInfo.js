import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { IoPersonAdd } from "react-icons/io5";
import { IoPersonRemove } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { IoAddCircleSharp } from "react-icons/io5";
import { IoRemoveCircle } from "react-icons/io5";
import {
  addUserToGroup,
  fetchAllChats,
  removeUserFromGroup,
} from "../redux/chat/chatApiRequest";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";

const ChatInfo = () => {
  const chatId = useParams().id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chats = useSelector((state) => state.chat.fetch.allChats);
  //   const foundChat = chats.find((chat) => chat._id === chatId);
  const loggedUser = useSelector((state) => state.user.login.currentUser);
  const users = useSelector((state) => state.user.users.allUsers);
  const axiosJWT = createAxios(loggedUser, dispatch, loginSuccess);
  const [foundChat, setFoundChat] = useState();
  //   const extractedChatId = chatId?.match(/(\d+)/)[0];
  const [isGroupChat, setGroupChat] = useState(false);
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [email, setEmail] = useState("");
  const [chatMembers, setChatMembers] = useState();
  const [groupAdmin, setGroupAdmin] = useState();

  const [addAction, setAddAction] = useState(false);
  const [removeAction, setRemoveAction] = useState(false);
  const [addedUser, setAddedUser] = useState();
  const [removedUser, setRemovedUser] = useState();
  const [searchAddQuery, setSearchAddQuery] = useState();
  const [searchRemoveQuery, setSearchRemoveQuery] = useState("");

  useEffect(() => {
    const thisChat = chats.find((chat) => chat._id === chatId);
    setFoundChat(thisChat);

    if (foundChat) {
      if (foundChat?.isGroupChat) {
        setGroupChat(true);
        setName(foundChat.chatName);
        setPic(
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        );
        setChatMembers(foundChat?.users);
        setGroupAdmin(foundChat?.groupAdmin);
      } else {
        setGroupChat(false);
        const otherUser = foundChat.users.find(
          (user) => user._id !== loggedUser._id
        );
        setName(otherUser?.name);
        setPic(otherUser?.pic);
        setEmail(otherUser?.email);
      }
    }
  }, [chats, chatId, loggedUser]);

  useEffect(() => {
    const fetchThisChat = async () => {
      try {
        await fetchAllChats(dispatch, loggedUser?.accessToken, axiosJWT);
      } catch (err) {
        console.log(err);
      }
    };
    fetchThisChat();
  }, [loggedUser, chats]);

  useEffect(() => {
    setChatMembers(foundChat?.users);
  });

  const handleAddUser = () => {
    setAddAction(!addAction);
    setRemoveAction(false);
  };

  const handleDeleteUser = () => {
    setRemoveAction(!removeAction);
    setAddAction(false);
  };

  const filteredAddedUsers = users
    ?.slice()
    .filter((user) =>
      user.email?.toLowerCase().includes(searchAddQuery?.toLowerCase())
    );

  const filteredRemovedUsers = chatMembers
    ?.slice()
    .filter((user) =>
      user.email?.toLowerCase().includes(searchRemoveQuery?.toLowerCase())
    );

  const checkUserAlreadyInChat = (userId) => {
    return chatMembers.some((member) => member._id === userId);
  };

  const addUser = async (user) => {
    const userId = user._id;
    if (checkUserAlreadyInChat(userId)) {
      console.log("1");
      return;
    }
    await addUserToGroup(
      chatId,
      userId,
      dispatch,
      loggedUser?.accessToken,
      axiosJWT
    );
    setAddAction(false);
  };

  const removeUser = async (user) => {
    console.log("start1");
    try {
      console.log("start");
      const userId = user._id;
      await removeUserFromGroup(
        chatId,
        userId,
        dispatch,
        loggedUser?.accessToken,
        axiosJWT
      );
      console.log("User removed successfully");
    } catch (error) {
      console.error("Error removing user:", error);
    } finally {
      setRemoveAction(false);
      if (user._id === loggedUser._id) {
        navigate("/chats");
      }
    }
  };

  return (
    <div>
      <div>
        <div>
          <Link to={`/chats/${chatId}`}>
            <div className="text-[rgb(134,122,245)] m-3">
              <AiOutlineArrowLeft className="w-8 h-8" />
            </div>
          </Link>
        </div>
        <div>
          <div className="flex flex-col mt-11 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80 space-y-4 mb-10">
            <div className="flex justify-center">
              <img src={pic} alt="avatar" className="w-32 h-32 rounded-full" />
            </div>
            <div className="flex justify-center text-2xl font-[600]">
              {name}
            </div>
          </div>
        </div>
      </div>
      {isGroupChat ? (
        <div>
          <div className="flex flex-col items-center">
            <div className="font-semibold text-[rgb(134,122,245)]">
              Change name or image
            </div>
            <div className="flex gap-x-4 m-4">
              <div
                className="rounded-full bg-[rgb(227,228,229)] p-3"
                onClick={() => handleAddUser()}
              >
                <IoPersonAdd />
              </div>
              <div
                className="rounded-full bg-[#e3e4e5] p-3"
                onClick={() => handleDeleteUser()}
              >
                <IoPersonRemove />
              </div>
            </div>
          </div>

          {addAction && (
            <div className="flex flex-col justify-start m-4 gap-y-4">
              <div className="mx-2 text-[#6b6c6c]">Add member</div>
              <div className="flex flex-col gap-y-4 bg-[#f6f6f7] rounded-lg p-4">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchAddQuery}
                  onChange={(e) => setSearchAddQuery(e.target.value)}
                />
                {searchAddQuery && (
                  <div className="flex flex-col gap-y-3">
                    {filteredAddedUsers.map((user) => (
                      <div className="flex ">
                        <div className="flex gap-x-3 m-1 justify-start">
                          <img
                            className="w-10 h-10 rounded-full"
                            src={user?.pic}
                            alt="ava"
                          />
                          <div className="text-md">
                            <div>{user?.name}</div>
                            <div>{user?.email}</div>
                          </div>
                        </div>
                        <div className=" flex w-full justify-end">
                          <button onClick={() => addUser(user)}>
                            <IoAddCircleSharp className="w-7 h-7 text-[rgb(134,122,245)]" />
                          </button>
                        </div>
                        <hr />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {removeAction && (
            <div className="flex flex-col justify-start m-4 gap-y-4">
              <div className="mx-2 text-[#6b6c6c]">Remove member</div>
              <div className="flex flex-col gap-y-4 bg-[#f6f6f7] rounded-lg p-4">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchRemoveQuery}
                  onChange={(e) => setSearchRemoveQuery(e.target.value)}
                />
                {searchRemoveQuery && (
                  <div className="flex flex-col gap-y-3">
                    {filteredRemovedUsers.map((user) => (
                      <div className="flex ">
                        <div className="flex gap-x-3 m-1 justify-start">
                          <img
                            className="w-10 h-10 rounded-full"
                            src={user?.pic}
                            alt="ava"
                          />
                          <div className="text-md">
                            <div>{user?.name}</div>
                            <div>{user?.email}</div>
                          </div>
                        </div>
                        <div className=" flex w-full justify-end">
                          <button onClick={() => removeUser(user)}>
                            <IoRemoveCircle className="w-7 h-7 text-[rgb(134,122,245)]" />
                          </button>
                        </div>
                        <hr />
                      </div>
                    ))}
                  </div>
                )}
                {searchRemoveQuery.trim() === "" &&
                  chatMembers.map((user) => (
                    <div className="flex ">
                      <div className="flex gap-x-3 m-1 justify-start">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={user?.pic}
                          alt="ava"
                        />
                        <div className="text-md">
                          <div>{user?.name}</div>
                          <div>{user?.email}</div>
                        </div>
                      </div>
                      <div className=" flex w-full justify-end">
                        <button onClick={() => removeUser(user)}>
                          <IoRemoveCircle className="w-7 h-7 text-[rgb(134,122,245)]" />
                        </button>
                      </div>
                      <hr />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="flex flex-col justify-start m-4 gap-y-4">
            <div className="mx-2 text-[#6b6c6c]">Chat members</div>
            <div className="flex flex-col gap-y-4 bg-[#f6f6f7] rounded-lg pt-4 px-4">
              {chatMembers.map((member) => (
                <div className="flex flex-col gap-y-3">
                  <div className="flex gap-x-3">
                    <img
                      className="w-12 h-12 rounded-full"
                      src={member?.pic}
                      alt="ava"
                    />
                    <div>
                      <div>{member?.name}</div>
                      {member?._id === groupAdmin?._id ? (
                        <div className="text-[rgb(127,127,128)]">
                          Group creator
                        </div>
                      ) : (
                        <div className="text-[rgb(127,127,128)]">Member</div>
                      )}
                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center ">
          <div className="font-bold">Email: </div>

          <div className="text-[#3f454b] ml-2"> {email}</div>
        </div>
      )}
    </div>
  );
};

export default ChatInfo;
