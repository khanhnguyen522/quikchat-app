import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Avatar from "../asset/avatar.svg";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../createInstance";
import { loginSuccess } from "../redux/user/userSlice";
import { createGroupChat, fetchAllChats } from "../redux/chat/chatApiRequest";

// tiny debounce hook so filtering large lists feels snappy
const useDebounced = (value, delay = 200) => {
  const [v, setV] = React.useState(value ?? "");
  React.useEffect(() => {
    const t = setTimeout(() => setV(value ?? ""), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v ?? "";
};

const CreateGroup = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allUsers = useSelector((s) => s?.user?.users?.allUsers) || [];
  const loggedUser = useSelector((s) => s?.user?.login?.currentUser) || null;
  const chats = useSelector((s) => s?.chat?.fetch?.allChats) || [];

  // axios instance that only changes when token changes
  const axiosJWT = React.useMemo(
    () => createAxios(loggedUser, dispatch, loginSuccess),
    [loggedUser?.accessToken] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // local state
  const [selectedUsers, setSelectedUsers] = React.useState([]); // array of user objects
  const [chatName, setChatName] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const myId = String(loggedUser?._id || "");
  const debouncedQuery = useDebounced(searchQuery, 200);
  const selectedIds = React.useMemo(
    () => new Set(selectedUsers.map((u) => String(u._id))),
    [selectedUsers]
  );

  // redirect if not logged in
  React.useEffect(() => {
    if (!loggedUser) navigate("/");
  }, [loggedUser, navigate]);

  // filter users: exclude me and already selected, search by name/email
  const filteredUsers = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return allUsers
      .filter((u) => String(u?._id) !== myId)
      .filter((u) => !selectedIds.has(String(u._id)))
      .filter(
        (u) =>
          u?.email?.toLowerCase().includes(q) ||
          u?.name?.toLowerCase().includes(q)
      )
      .slice(0, 50); // cap for performance
  }, [allUsers, debouncedQuery, myId, selectedIds]);

  const addUser = (user) => {
    const id = String(user?._id);
    if (!id || id === myId || selectedIds.has(id)) return;
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery("");
  };

  const removeUser = (user) => {
    const id = String(user?._id);
    setSelectedUsers((prev) => prev.filter((u) => String(u._id) !== id));
  };

  const canSubmit =
    !!chatName.trim() && selectedUsers.length >= 1 && !isSubmitting;

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const usersJSON = JSON.stringify(selectedUsers.map((u) => u._id));

      const res = await createGroupChat(
        chatName.trim(),
        usersJSON,
        dispatch,
        loggedUser?.accessToken,
        axiosJWT,
        navigate // your helper already navigates, keeping compatibility
      );

      // If your helper didn’t navigate, try to refresh list & best-effort navigate:
      if (!res) {
        await fetchAllChats(dispatch, loggedUser?.accessToken, axiosJWT);
        const byName = chats.find(
          (c) => c?.isGroupChat && c?.chatName === chatName.trim()
        );
        if (byName?._id) navigate(`/chats/${byName._id}`);
        else navigate("/chats");
      }
    } catch (err) {
      console.error(err);
      // TODO: show toast/error UI if you have one
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top bar */}
      <div className="fixed top-0 w-full z-10 bg-black/10">
        <div className="flex p-2 mx-3">
          <Link to="/chats">
            <div className="text-[rgb(134,122,245)]">
              <AiOutlineArrowLeft className="w-8 h-8" />
            </div>
          </Link>
          <div className="flex items-center w-full justify-center mr-8">
            <div className="text-[rgb(134,122,245)]">New Group</div>
          </div>
        </div>
      </div>

      <div className="mt-20 sm:mx-32 md:mx-40 lg:mx-60 xl:mx-80">
        <div className="flex justify-center">
          <img
            src={Avatar}
            alt="avatar"
            className="w-32 h-32 rounded-full"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="m-6">
          <form
            className="my-12 text-sm mx-4 lg:mx-28 md:mx-12"
            onSubmit={handleCreateGroup}
          >
            {/* Group name */}
            <div className="flex flex-col my-6 gap-y-1">
              <label className="font-thin" htmlFor="group-name">
                Group Name
              </label>
              <input
                id="group-name"
                className="rounded-md h-8 border"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                maxLength={80}
                placeholder="Enter a group name"
              />
            </div>

            {/* Selected users pills */}
            <div className="flex flex-col my-6 gap-y-1">
              <label className="font-thin" htmlFor="users">
                Users
              </label>
              <div className="flex flex-wrap gap-2 my-2 text-[14px]">
                {selectedUsers.map((u) => (
                  <button
                    type="button"
                    onClick={() => removeUser(u)}
                    key={u._id}
                    className="my-1 border rounded-lg bg-[rgb(134,122,245)] px-2 py-1 flex items-center gap-2 text-white"
                    title="Remove"
                    aria-label={`Remove ${u?.email}`}
                  >
                    <span className="font-bold text-sm">×</span>
                    <span>{u?.email}</span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                className="rounded-md h-8 border"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Results */}
              {searchQuery && (
                <div className="max-h-[240px] overflow-y-auto mt-2 pr-1">
                  {filteredUsers.map((u) => (
                    <button
                      type="button"
                      className="w-full text-left py-2"
                      key={u._id}
                      onClick={() => addUser(u)}
                    >
                      <div className="grid grid-cols-5">
                        <div className="flex items-center">
                          <img
                            className="w-14 h-14 rounded-full"
                            src={
                              u?.pic ||
                              "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                            }
                            alt={u?.name || "user"}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="col-span-4 flex flex-col justify-center">
                          <div className="text-black font-[600]">{u?.name}</div>
                          <div className="text-black font-[400]">
                            {u?.email}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-xs text-gray-500 px-1 py-2">
                      No matches.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-center items-center rounded-md h-10 mx-4 lg:mx-28 md:mx-12 my-16">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full h-full rounded-md ${
                  canSubmit
                    ? "bg-[rgb(134,122,245)] text-white"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "CREATING…" : "CREATE GROUP"}
              </button>
            </div>
          </form>

          <div className="pb-12" />
        </div>
      </div>
    </div>
  );
});

export default CreateGroup;
