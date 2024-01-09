import axios from "axios";
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
} from "./chatSlice";

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
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(accessSuccess(res.data));
    navigate(`/chats/${res.data._id}`);
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
    // return res.data;
  } catch (err) {
    console.log(err);
    dispatch(fetchFailed());
  }
};

export const createGroupChat = async (
  name,
  users,
  dispatch,
  accessToken,
  axiosJWT,
  navigate
) => {
  dispatch(createGroupStart());
  try {
    const res = await axiosJWT.post(
      "/v1/chat/group",
      { name, users },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    console.log(res.data);
    dispatch(createGroupSuccess(res.data));
    navigate(`/chats/${res.data._id}`);
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
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(addUserToGroupSuccess(res.data));
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
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(removeUserFromGroupSuccess(res.data));
  } catch (err) {
    console.log(err);
    dispatch(removeUserFromGroupFailed());
  }
};
