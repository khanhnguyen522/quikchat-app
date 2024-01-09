import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    login: {
      currentUser: null,
      isFetching: false,
      error: false,
    },
    register: {
      currentUser: null,
      isFetching: false,
      error: false,
    },
    edit: {
      currentUser: null,
      isFetching: false,
      error: false,
    },
    users: {
      allUsers: null,
      isFetching: false,
      error: false,
    },
  },
  reducers: {
    loginStart: (state) => {
      state.login.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.currentUser = action.payload;
    },
    loginFailed: (state) => {
      state.login.isFetching = false;
      state.login.error = true;
    },
    registerStart: (state) => {
      state.register.isFetching = true;
    },
    registerSuccess: (state, action) => {
      state.register.isFetching = false;
      state.register.currentUser = action.payload;
      state.login.currentUser = action.payload;
    },
    registerFailed: (state) => {
      state.register.error = true;
      state.register.isFetching = false;
    },
    logoutStart: (state) => {
      state.login.isFetching = true;
    },
    logoutSuccess: (state) => {
      state.login.isFetching = false;
      state.login.currentUser = null;
    },
    logoutFailed: (state) => {
      state.login.isFetching = false;
      state.login.error = true;
    },
    editStart: (state) => {
      state.edit.isFetching = true;
    },
    editSuccess: (state, action) => {
      state.edit.isFetching = false;
      state.edit.currentUser = action.payload;
      state.login.currentUser = action.payload;
      state.register.currentUser = action.payload;
    },
    editFailed: (state) => {
      state.edit.isFetching = false;
      state.edit.error = true;
    },
    getUsersStart: (state) => {
      state.users.isFetching = true;
    },
    getUsersSuccess: (state, action) => {
      state.users.isFetching = false;
      state.users.allUsers = action.payload;
    },
    getUsersFailed: (state) => {
      state.users.isFetching = false;
      state.users.error = true;
    },
  },
});

export const {
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
  editSuccess,
  editFailed,
  getUsersStart,
  getUsersSuccess,
  getUsersFailed,
} = userSlice.actions;
export default userSlice.reducer;
