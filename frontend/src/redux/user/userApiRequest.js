import axios from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailed,
  registerStart,
  registerSuccess,
  registerFailed,
  logoutStart,
  logoutSuccess,
  logoutFailed,
  editStart,
  editFailed,
  getUsersStart,
  getUsersSuccess,
  getUsersFailed,
  editSuccess,
} from "./userSlice";
import { resetChatState } from "../chat/chatSlice";
import { resetMessageState } from "../message/messageSlice";
import { createAxios } from "../../createInstance";
import { fetchAllChats } from "../chat/chatApiRequest";

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/user/login", user);
    const newUser = res.data;

    // ✅ CLEAR previous session state FIRST
    dispatch(resetChatState());
    dispatch(resetMessageState());

    // ✅ Store new session
    dispatch(loginSuccess(newUser));
    localStorage.setItem("user", JSON.stringify(newUser));

    // ✅ Kick off initial data with the NEW token
    const axiosForNew = createAxios(newUser, dispatch, loginSuccess);
    fetchAllChats(dispatch, newUser.accessToken, axiosForNew);
    getAllUsers(dispatch, newUser.accessToken, axiosForNew);

    navigate("/chats");
  } catch (err) {
    console.log(err);
    dispatch(loginFailed());
  }
};

// REGISTER
export const registerUser = async (user, dispatch, navigate) => {
  dispatch(registerStart());
  try {
    const res = await axios.post("/v1/user/", user);
    const newUser = res.data;

    // ✅ CLEAR previous session state FIRST
    dispatch(resetChatState());
    dispatch(resetMessageState());

    // ✅ Store new session
    dispatch(registerSuccess(newUser)); // or loginSuccess(newUser) if you prefer one path
    localStorage.setItem("user", JSON.stringify(newUser));

    // ✅ Kick off initial data with the NEW token
    const axiosForNew = createAxios(newUser, dispatch, loginSuccess);
    fetchAllChats(dispatch, newUser.accessToken, axiosForNew);
    getAllUsers(dispatch, newUser.accessToken, axiosForNew);

    navigate("/chats");
  } catch (err) {
    console.log(err);
    dispatch(registerFailed());
  }
};

// LOGOUT
export const logout = async (dispatch, id, navigate, accessToken, axiosJWT) => {
  dispatch(logoutStart());
  try {
    // If your server uses a refresh-token cookie, ask it to clear
    await axiosJWT.post("/v1/user/logout", id, {
      headers: { token: `Bearer ${accessToken}` },
    });
  } catch (err) {
    console.log(err);
    // swallow error – we still clear client state
  } finally {
    // ✅ CLEAR all client session state
    dispatch(resetChatState());
    dispatch(resetMessageState());
    dispatch(logoutSuccess());
    localStorage.removeItem("user");
    navigate("/");
  }
};

export const editProfile = async (
  dispatch,
  user,
  navigate,
  accessToken,
  axiosJWT
) => {
  dispatch(editStart());
  try {
    const res = await axiosJWT.post("/v1/user/profile", user, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(editSuccess(res.data));
    navigate("/profile");
  } catch (err) {
    console.log(err);
    dispatch(editFailed());
  }
};

export const getAllUsers = async (dispatch, accessToken, axiosJWT) => {
  dispatch(getUsersStart());
  try {
    const res = await axiosJWT.get("/v1/user/", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getUsersSuccess(res.data));
  } catch (err) {
    console.log(err);
    dispatch(getUsersFailed());
  }
};
