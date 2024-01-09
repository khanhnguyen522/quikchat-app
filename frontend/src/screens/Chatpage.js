import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import FriendList from "../components/FriendList";
import { BsPeopleFill } from "react-icons/bs";
import { BsFillChatFill } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BiMessageEdit } from "react-icons/bi";
import { AiOutlineArrowLeft } from "react-icons/ai";
import avatar from "../asset/avatar.svg";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/user/userSlice";
import { fetchAllChats } from "../redux/chat/chatApiRequest";
import { createAxios } from "../createInstance";
import { getAllUsers } from "../redux/user/userApiRequest";
import SearchedFriends from "../components/SearchedFriends";

const Chatpage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const user = useSelector((state) => state.user.login.currentUser);
  const accessToken = user?.accessToken;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector((state) => state.chat.fetch.allChats);

  let axiosJWT = createAxios(user, dispatch, loginSuccess);
  const users = useSelector((state) => state.user.users.allUsers);

  useEffect(() => {
    if (user?.accessToken) {
      fetchAllChats(dispatch, user?.accessToken, axiosJWT);
    }
    if (user?.accessToken) {
      getAllUsers(dispatch, user?.accessToken, axiosJWT);
    }
    if (!user) {
      navigate("/");
    }
  }, []);

  const [search, setSearch] = useState(false);
  const chatsTabs = [
    <BsFillChatFill className="w-6 h-6" />,
    <BsPeopleFill className="w-6 h-6" />,
  ];
  const [activeChatTab, setActiveChatTab] = useState(0);

  const handleChatTabClick = (idx) => {
    setActiveChatTab(idx);
  };

  const handleClickSearch = () => {
    setSearch(true);
  };

  const handleSearchBack = () => {
    setSearch(false);
  };

  const filteredUsers = users
    ?.slice()
    .filter((user) =>
      user.email?.toLowerCase().includes(searchQuery?.toLowerCase())
    );

  return (
    <div className=" container text-white">
      <div className=" fixed top-0 w-full z-10 backdrop-blur-xl bg-white/75">
        <div className="">
          <div className="flex justify-between pt-3 mx-3">
            <Link to="/profile">
              <div className="text-[rgb(134,122,245)]">
                <IoPersonCircleSharp className="w-8 h-8" />
              </div>
            </Link>
            <div className="flex items-center">
              <p className="text-[rgb(134,122,245)] ">Chats</p>
            </div>
            <Link to="/creategroup">
              <div className="text-[rgb(134,122,245)]">
                <BiMessageEdit className="w-8 h-8" />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center pt-14">
        {search ? (
          <div className=" w-[100%] flex flex-col space-y-8">
            <div className="flex justify-center items-center mt-2 space-x-1">
              <div
                onClick={handleSearchBack}
                className="text-[rgb(134,122,245)]"
              >
                <AiOutlineArrowLeft className="w-7 h-7" />
              </div>
              <input
                className="w-10/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin  text-black"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div>
                <SearchedFriends users={filteredUsers} />
              </div>
            )}
          </div>
        ) : (
          <input
            className="w-11/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin mt-2 text-black"
            type="text"
            placeholder="Search"
            onClick={handleClickSearch}
          />
        )}
      </div>
      {search ? (
        <div></div>
      ) : (
        <div>
          <div className="mt-9 mb-12">
            {activeChatTab === 0 ? (
              <ChatList chats={chats} />
            ) : (
              <FriendList chats={chats} />
            )}
          </div>

          <div className="fixed bottom-0 w-full ">
            <div className=" backdrop-blur-xl bg-white/75">
              <div className="flex justify-around py-3 ">
                {chatsTabs.map((tab, idx) => {
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => handleChatTabClick(idx)}
                        className={
                          activeChatTab === idx
                            ? "text-[rgb(134,122,245)]"
                            : "text-[#46494d]"
                        }
                      >
                        {tab}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatpage;
