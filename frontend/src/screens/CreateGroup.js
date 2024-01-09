import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Avatar from "../asset/avatar.svg";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { createGroupChat, fetchAllChats } from "../redux/chat/chatApiRequest";
import axios from "axios";

const CreateGroup = React.memo(() => {
  const [newGroupChat, setNewGroupChat] = useState();
  const [users, setUsers] = useState([]);
  const [chatName, setChatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allUsers = useSelector((state) => state.user.users.allUsers);
  const loggedUser = useSelector((state) => state.user.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = createAxios(loggedUser, dispatch, loginSuccess);

  const chats = useSelector((state) => state.chat.fetch.allChats);
  const groupChat = useSelector((state) => state.chat.createGroup.group);

  const filteredUsers = allUsers
    ?.slice()
    .filter((user) =>
      user.email?.toLowerCase().includes(searchQuery?.toLowerCase())
    );

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const usersJSON = JSON.stringify(users.map((user) => user._id));
    await createGroupChat(
      chatName,
      usersJSON,
      dispatch,
      loggedUser?.accessToken,
      axiosJWT,
      navigate
    );
  };

  const handleDeleteUser = (deletedUser) => {
    setUsers(users.filter((user) => user._id !== deletedUser._id));
  };

  const handleClickUser = (user) => {
    if (users.includes(user)) {
      return;
    }
    if (users !== null) {
      setUsers([...users, user]);
    } else {
      setUsers([user]);
    }

    setSearchQuery("");
  };

  return (
    <div>
      <div className=" fixed top-0 w-full z-10 bg-black/10">
        <div className="">
          <div className="flex p-2 mx-3 ">
            <Link to="/chats">
              <div className="text-[rgb(134,122,245)]">
                <AiOutlineArrowLeft className="w-8 h-8" />
              </div>
            </Link>
            <div className="flex items-center w-[100%] justify-center mr-8">
              <div className="text-[rgb(134,122,245)]">New Group</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80">
        <div className="flex justify-center">
          <img src={Avatar} alt="avatar" className="w-32 h-32 rounded-full" />
        </div>
        <div className="m-6">
          <form
            className="my-12 text-sm mx-4 lg:mx-28 md:mx-12"
            onSubmit={handleCreateGroup}
          >
            <div className="flex flex-col  my-6 gap-y-1">
              <label className="font-thin" htmlFor="username">
                Group Name
              </label>
              <input
                className="rounded-md h-8 border border-1"
                id="name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>

            <div className="flex flex-col  my-6 gap-y-1">
              <label className="font-thin" htmlFor="email">
                Users
              </label>
              <div className="flex flex-wrap space-x-2 my-2 text-[18px]">
                {users &&
                  users.map((user) => (
                    <button
                      onClick={() => handleDeleteUser(user)}
                      key={user._id}
                      className="my-2 border rounded-lg bg-[rgb(134,122,245)] p-1 flex space-x-1 "
                    >
                      <div className="text-white flex ">x</div>
                      <div>{user.email}</div>
                    </button>
                  ))}
              </div>
              <input
                className="rounded-md h-8 border border-1"
                id="email"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="max-h-[200px] overflow-x-scroll">
                  {filteredUsers?.map((user) => (
                    <div
                      className="my-2"
                      key={user._id}
                      onClick={() => handleClickUser(user)}
                    >
                      <div className="w-full">
                        <div className="grid grid-cols-5 text-left ">
                          <div className="">
                            <img
                              className="w-14 h-14 rounded-full"
                              src={user.pic}
                              alt="ava"
                            />
                          </div>
                          <div className="col-span-4 flex flex-col items-start justify-center">
                            <div className="text-black font-[500]">
                              {user.name}
                            </div>
                            <div className="text-black font-[400]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center items-center rounded-md h-8 bg-[rgb(134,122,245)] text-white mx-4 lg:mx-28 md:mx-12 my-16">
              <button type="submit">CREATE GROUP</button>
            </div>
          </form>
          <div className="pb-12"></div>
        </div>
      </div>
    </div>
  );
});

export default CreateGroup;
