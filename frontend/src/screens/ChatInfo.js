// client/src/pages/ChatInfo.jsx
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import {
  IoPersonAdd,
  IoPersonRemove,
  IoAddCircleSharp,
  IoRemoveCircle,
} from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import {
  addUserToGroup,
  fetchAllChats,
  removeUserFromGroup,
} from "../redux/chat/chatApiRequest";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";

// tiny debounce util
const useDebounced = (value, delay = 200) => {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value ?? ""), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v ?? "";
};

const ChatInfo = () => {
  const { id: chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chats = useSelector((s) => s.chat.fetch.allChats) || [];
  const loggedUser = useSelector((s) => s.user.login.currentUser);
  const allUsers = useSelector((s) => s.user.users.allUsers) || [];

  // axios instance that updates only when token changes
  const axiosJWT = React.useMemo(
    () => createAxios(loggedUser, dispatch, loginSuccess),
    [loggedUser?.accessToken] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // fetch once on mount (or when token changes), NOT when chats change
  React.useEffect(() => {
    if (!loggedUser) {
      navigate("/");
      return;
    }
    if (!axiosJWT) return;
    fetchAllChats(dispatch, loggedUser.accessToken, axiosJWT);
  }, [loggedUser?.accessToken, axiosJWT, dispatch, navigate]);

  // derive the current chat (no local copy)
  const foundChat = React.useMemo(
    () => chats.find((c) => String(c?._id) === String(chatId)),
    [chats, chatId]
  );

  const isGroupChat = !!foundChat?.isGroupChat;

  // derive header info
  const { name, pic, email } = React.useMemo(() => {
    if (!foundChat) return { name: "", pic: "", email: "" };
    if (foundChat.isGroupChat) {
      return {
        name: foundChat.chatName,
        pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        email: "",
      };
    }
    const me = String(loggedUser?._id || "");
    const other = (foundChat.users || []).find((u) => String(u?._id) !== me);
    return {
      name: other?.name || "",
      pic: other?.pic || "",
      email: other?.email || "",
    };
  }, [foundChat, loggedUser?._id]);

  const chatMembers = foundChat?.users || [];
  const groupAdmin = foundChat?.groupAdmin;

  // UI toggles
  const [addAction, setAddAction] = React.useState(false);
  const [removeAction, setRemoveAction] = React.useState(false);

  // searches with debounce
  const [searchAddQuery, setSearchAddQuery] = React.useState("");
  const [searchRemoveQuery, setSearchRemoveQuery] = React.useState("");
  const qAdd = useDebounced(searchAddQuery, 200);
  const qRemove = useDebounced(searchRemoveQuery, 200);

  // filtered lists (memoized)
  const filteredAddUsers = React.useMemo(() => {
    const q = qAdd.trim().toLowerCase();
    if (!q) return [];
    return allUsers.filter((u) => u.email?.toLowerCase().includes(q));
  }, [allUsers, qAdd]);

  const filteredRemoveUsers = React.useMemo(() => {
    const q = qRemove.trim().toLowerCase();
    const list = chatMembers;
    if (!q) return list;
    return list.filter((u) => u.email?.toLowerCase().includes(q));
  }, [chatMembers, qRemove]);

  const handleAddToggle = () => {
    setAddAction((v) => !v);
    setRemoveAction(false);
  };
  const handleRemoveToggle = () => {
    setRemoveAction((v) => !v);
    setAddAction(false);
  };

  const isInChat = React.useCallback(
    (userId) => chatMembers.some((m) => String(m?._id) === String(userId)),
    [chatMembers]
  );

  const addUser = async (user) => {
    const userId = user._id;
    if (isInChat(userId)) return;
    await addUserToGroup(
      chatId,
      userId,
      dispatch,
      loggedUser?.accessToken,
      axiosJWT
    );
    setAddAction(false);
    setSearchAddQuery("");
  };

  const removeUser = async (user) => {
    try {
      const userId = user._id;
      await removeUserFromGroup(
        chatId,
        userId,
        dispatch,
        loggedUser?.accessToken,
        axiosJWT
      );
    } catch (e) {
      console.error(e);
    } finally {
      setRemoveAction(false);
      setSearchRemoveQuery("");
      if (String(user?._id) === String(loggedUser?._id)) {
        navigate("/chats");
      }
    }
  };

  if (!foundChat) {
    return (
      <div className="p-4">
        <Link
          to="/chats"
          className="text-[rgb(134,122,245)] flex items-center gap-2"
        >
          <AiOutlineArrowLeft className="w-6 h-6" />
          Back
        </Link>
        <div className="mt-6 text-sm text-gray-600">Loading chat info…</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div>
        <Link to={`/chats/${chatId}`}>
          <div className="text-[rgb(134,122,245)] m-3">
            <AiOutlineArrowLeft className="w-8 h-8" />
          </div>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-col mt-11 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80 space-y-4 mb-10">
          <div className="flex justify-center">
            <img
              src={pic}
              alt="avatar"
              className="w-32 h-32 rounded-full"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex justify-center text-2xl font-[600]">{name}</div>
        </div>
      </div>

      {isGroupChat ? (
        <div>
          {/* Actions */}
          <div className="flex flex-col items-center">
            <div className="font-semibold text-[rgb(134,122,245)]">
              Change name or image
            </div>
            <div className="flex gap-x-4 m-4">
              <button
                type="button"
                className="rounded-full bg-[rgb(227,228,229)] p-3"
                onClick={handleAddToggle}
                aria-label="Add member"
              >
                <IoPersonAdd />
              </button>
              <button
                type="button"
                className="rounded-full bg-[#e3e4e5] p-3"
                onClick={handleRemoveToggle}
                aria-label="Remove member"
              >
                <IoPersonRemove />
              </button>
            </div>
          </div>

          {/* Add member */}
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
                {qAdd && (
                  <div className="flex flex-col gap-y-3">
                    {filteredAddUsers.map((u) => (
                      <div
                        className="flex items-center justify-between"
                        key={u._id}
                      >
                        <div className="flex gap-x-3 m-1 justify-start">
                          <img
                            className="w-10 h-10 rounded-full"
                            src={u?.pic}
                            alt="ava"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="text-md">
                            <div>{u?.name}</div>
                            <div className="text-sm text-gray-500">
                              {u?.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => addUser(u)}
                          aria-label="Add this user"
                        >
                          <IoAddCircleSharp className="w-7 h-7 text-[rgb(134,122,245)]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remove member */}
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
                <div className="flex flex-col gap-y-3">
                  {filteredRemoveUsers.map((u) => (
                    <div
                      className="flex items-center justify-between"
                      key={u._id}
                    >
                      <div className="flex gap-x-3 m-1 justify-start">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={u?.pic}
                          alt="ava"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="text-md">
                          <div>{u?.name}</div>
                          <div className="text-sm text-gray-500">
                            {u?.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUser(u)}
                        aria-label="Remove this user"
                      >
                        <IoRemoveCircle className="w-7 h-7 text-[rgb(134,122,245)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members */}
          <div className="flex flex-col justify-start m-4 gap-y-4">
            <div className="mx-2 text-[#6b6c6c]">Chat members</div>
            <div className="flex flex-col gap-y-4 bg-[#f6f6f7] rounded-lg pt-4 px-4">
              {chatMembers.map((m) => (
                <div className="flex flex-col gap-y-3" key={m._id}>
                  <div className="flex gap-x-3">
                    <img
                      className="w-12 h-12 rounded-full"
                      src={m?.pic}
                      alt="ava"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <div>{m?.name}</div>
                      {String(m?._id) === String(groupAdmin?._id) ? (
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
        // 1:1 chat info
        <div className="flex justify-center">
          <div className="font-bold">Email:</div>
          <div className="text-[#3f454b] ml-2">{email}</div>
        </div>
      )}
    </div>
  );
};

export default ChatInfo;
