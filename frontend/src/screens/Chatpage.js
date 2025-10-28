// client/src/pages/Chatpage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList";
import FriendList from "../components/FriendList";
import { BsPeopleFill, BsFillChatFill } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BiMessageEdit } from "react-icons/bi";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/user/userSlice";
import { fetchAllChats, fetchChatById } from "../redux/chat/chatApiRequest";
import { createAxios } from "../createInstance";
import { getAllUsers } from "../redux/user/userApiRequest";
import SearchedFriends from "../components/SearchedFriends";
import { setLatestMessageAndBump } from "../redux/chat/chatSlice";
import { getSocket } from "../lib/socket";

const Chatpage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [search, setSearch] = React.useState(false);
  const [activeChatTab, setActiveChatTab] = React.useState(0);

  const user = useSelector((state) => state.user.login.currentUser);
  const chats = useSelector((state) => state.chat.fetch.allChats);
  const users = useSelector((state) => state.user.users.allUsers);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const axiosJWT = React.useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user?.accessToken] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Initial data
  React.useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (!axiosJWT) return;

    fetchAllChats(dispatch, user.accessToken, axiosJWT);
    getAllUsers(dispatch, user.accessToken, axiosJWT);
  }, [user?._id, user?.accessToken, axiosJWT, dispatch, navigate]);

  // 🔊 Join all chat rooms + listen for message:new to bump/sort list
  React.useEffect(() => {
    if (!user?.accessToken) return;
    const socket = getSocket(user.accessToken);

    // join every chat room we know
    const ids = (chats || []).map((c) => String(c._id));
    ids.forEach((id) => socket.emit("chat:join", { chatId: id }));

    const handleNewMessage = (msg) => {
      const chatId = String(msg?.chat?._id || "");
      if (!chatId) return;

      // If this chat isn't in the list yet, fetch it once
      const exists = (chats || []).some((c) => String(c._id) === chatId);
      if (!exists) {
        fetchChatById(chatId, dispatch, user.accessToken, axiosJWT);
      }

      // bump latestMessage + updatedAt for sorting
      dispatch(
        setLatestMessageAndBump({
          chatId,
          message: msg,
          updatedAt: msg.createdAt,
        })
      );
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      ids.forEach((id) => socket.emit("chat:leave", { chatId: id }));
      socket.off("message:new", handleNewMessage);
    };
    // re-run when the set of chat IDs changes
  }, [
    user?.accessToken,
    dispatch,
    axiosJWT,
    JSON.stringify((chats || []).map((c) => c._id)),
  ]);

  // 🔽 Sort chats by latest activity (latestMessage.createdAt fallback to updatedAt)
  const sortedChats = React.useMemo(() => {
    const getTime = (c) =>
      new Date(c?.latestMessage?.createdAt || c?.updatedAt || 0).getTime();
    return [...(chats || [])].sort((a, b) => getTime(b) - getTime(a));
  }, [chats]);

  const filteredUsers =
    users
      ?.slice()
      .filter((u) =>
        u.email?.toLowerCase().includes(searchQuery?.toLowerCase())
      ) || [];

  const chatsTabs = [
    <BsFillChatFill className="w-6 h-6" key="tab-chats" />,
    <BsPeopleFill className="w-6 h-6" key="tab-people" />,
  ];

  return (
    <div className="container text-white">
      {/* header */}
      <div className="fixed top-0 w-full z-10 backdrop-blur-xl bg-white/75">
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

      {/* search */}
      <div className="flex justify-center items-center pt-14">
        {search ? (
          <div className="w-[100%] flex flex-col space-y-8">
            <div className="flex justify-center items-center mt-2 space-x-1">
              <div
                onClick={() => setSearch(false)}
                className="text-[rgb(134,122,245)]"
              >
                <AiOutlineArrowLeft className="w-7 h-7" />
              </div>
              <input
                autoFocus
                className="w-10/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin text-black"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && <SearchedFriends users={filteredUsers} />}
          </div>
        ) : (
          <input
            className="w-11/12 h-8 border rounded-lg border-hidden focus:outline-none backdrop-blur-md bg-[#e9ecee] pl-2 text-md font-thin mt-2 text-black"
            type="text"
            placeholder="Search"
            onClick={() => setSearch(true)}
          />
        )}
      </div>

      {/* chat list */}
      {search ? (
        <div />
      ) : (
        <div>
          <div className="mt-9 mb-12">
            {activeChatTab === 0 ? (
              <ChatList chats={sortedChats} />
            ) : (
              <FriendList chats={sortedChats} />
            )}
          </div>

          <div className="fixed bottom-0 w-full">
            <div className="backdrop-blur-xl bg-white/75">
              <div className="flex justify-around py-3">
                {chatsTabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveChatTab(idx)}
                    className={
                      activeChatTab === idx
                        ? "text-[rgb(134,122,245)]"
                        : "text-[#46494d]"
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatpage;
