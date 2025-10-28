import {
  accessStart,
  accessFailed,
  accessSuccess,
  fetchFailed,
  fetchStart,
  fetchSuccess,
  createGroupStart,
  createGroupSuccess,
  createGroupFailed,
  addUserToGroupFailed,
  addUserToGroupStart,
  addUserToGroupSuccess,
  removeUserFromGoupStart,
  removeUserFromGroupFailed,
  removeUserFromGroupSuccess,
  getByIdStart,
  getByIdSuccess,
  getByIdFailed,
  addOrUpdateChat,
} from "./chatSlice";

/** Normalize "users" into an array of ids, even if passed a JSON string */
const normalizeUsers = (users) => {
  try {
    if (typeof users === "string") {
      const parsed = JSON.parse(users);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return Array.isArray(users) ? users : [];
};

export const accessSingleChat = async (
  userId,
  dispatch,
  accessToken,
  axiosJWT,
  navigate
) => {
  dispatch(accessStart());
  try {
    const res = await axiosJWT.post(
      "/v1/chat",
      { userId },
      { headers: { token: `Bearer ${accessToken}` } }
    );
    const chat = res.data;
    dispatch(accessSuccess(chat));
    if (navigate && chat?._id) navigate(`/chats/${chat._id}`);
    return chat;
  } catch (err) {
    console.log(err);
    dispatch(accessFailed());
  }
};

export const fetchAllChats = async (dispatch, accessToken, axiosJWT) => {
  dispatch(fetchStart());
  try {
    const res = await axiosJWT.get("/v1/chat/", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(fetchSuccess(res.data));
    return res.data;
  } catch (err) {
    console.log(err);
    dispatch(fetchFailed());
  }
};

export const createGroupChat = async (
  name,
  users, // can be JSON string or array
  dispatch,
  accessToken,
  axiosJWT,
  navigate
) => {
  dispatch(createGroupStart());
  try {
    const usersArr = normalizeUsers(users);
    const payload = { name, users: usersArr };

    const res = await axiosJWT.post("/v1/chat/group", payload, {
      headers: { token: `Bearer ${accessToken}` },
    });

    const chat = res.data;
    dispatch(createGroupSuccess(chat));
    // immediate list update (helps Chatpage even before fetchAllChats)
    dispatch(addOrUpdateChat(chat));

    if (navigate && chat?._id) navigate(`/chats/${chat._id}`);
    return chat;
  } catch (err) {
    console.log(err);
    dispatch(createGroupFailed());
  }
};

export const addUserToGroup = async (
  chatId,
  userId,
  dispatch,
  accessToken,
  axiosJWT
) => {
  dispatch(addUserToGroupStart());
  try {
    const res = await axiosJWT.put(
      "/v1/chat/groupadd",
      { chatId, userId },
      { headers: { token: `Bearer ${accessToken}` } }
    );
    const chat = res.data;
    dispatch(addUserToGroupSuccess(chat));
    dispatch(addOrUpdateChat(chat));
    return chat;
  } catch (err) {
    console.log(err);
    dispatch(addUserToGroupFailed());
  }
};

export const removeUserFromGroup = async (
  chatId,
  userId,
  dispatch,
  accessToken,
  axiosJWT
) => {
  dispatch(removeUserFromGoupStart());
  try {
    const res = await axiosJWT.put(
      "/v1/chat/groupremove",
      { chatId, userId },
      { headers: { token: `Bearer ${accessToken}` } }
    );
    const chat = res.data;
    dispatch(removeUserFromGroupSuccess(chat));
    dispatch(addOrUpdateChat(chat));
    return chat;
  } catch (err) {
    console.log(err);
    dispatch(removeUserFromGroupFailed());
  }
};

export const fetchChatById = async (
  chatId,
  dispatch,
  accessToken,
  axiosJWT
) => {
  dispatch(getByIdStart());
  try {
    const res = await axiosJWT.get(`/v1/chat/${chatId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    const chat = res.data;
    dispatch(getByIdSuccess(chat));
    // also ensure it's present/sorted in list
    dispatch(addOrUpdateChat(chat));
    return chat;
  } catch (err) {
    console.log(err);
    dispatch(getByIdFailed());
  }
};
