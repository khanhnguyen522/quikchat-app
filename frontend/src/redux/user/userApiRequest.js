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

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/user/login", user);
    dispatch(loginSuccess(res.data));
    navigate("/chats");
  } catch (err) {
    console.log(err);
    dispatch(loginFailed());
  }
};

export const registerUser = async (user, dispatch, navigate) => {
  dispatch(registerStart());
  try {
    const res = await axios.post("/v1/user/", user);
    dispatch(registerSuccess(res.data));
    navigate("/chats");
  } catch (err) {
    console.log(err);
    dispatch(registerFailed());
  }
};

export const logout = async (dispatch, id, navigate, accessToken, axiosJWT) => {
  dispatch(logoutStart());
  try {
    await axiosJWT.post("/v1/user/logout", id, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(logoutSuccess());
    navigate("/");
  } catch (err) {
    console.log(err);
    dispatch(logoutFailed());
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
