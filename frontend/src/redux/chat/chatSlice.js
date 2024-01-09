import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    access: {
      chat: null,
      isFetching: false,
      error: false,
    },
    fetch: {
      allChats: null,
      isFetching: true,
      error: false,
    },
    group: {
      currGroup: null,
      isFetching: false,
      error: false,
    },
    remove: {
      isFetching: false,
      error: false,
    },
    add: {
      isFetching: false,
      error: false,
    },
  },
  reducers: {
    accessStart: (state) => {
      state.access.isFetching = true;
    },
    accessSuccess: (state, action) => {
      state.access.isFetching = false;
      state.access.chat = action.payload;
      state.fetch.allChats = state.fetch.allChats
        ? [...state.fetch.allChats, action.payload]
        : [action.payload];
    },
    accessFailed: (state) => {
      state.access.isFetching = false;
      state.access.error = true;
    },
    fetchStart: (state) => {
      state.fetch.isFetching = true;
    },
    fetchSuccess: (state, action) => {
      state.fetch.isFetching = false;
      state.fetch.allChats = action.payload;
    },
    fetchFailed: (state) => {
      state.fetch.isFetching = false;
      state.fetch.error = true;
    },
    createGroupStart: (state) => {
      state.createGroup.isFetching = true;
    },
    createGroupSuccess: (state, action) => {
      state.createGroup.isFetching = false;
      state.group.currGroup = action.payload;
      state.fetch.allChats = state.fetch.allChats
        ? [...state.fetch.allChats, action.payload]
        : [action.payload];
    },
    createGroupFailed: (state) => {
      state.createGroup.isFetching = false;
      state.createGroup.error = true;
    },
    addUserToGroupStart: (state) => {
      state.add.isFetching = true;
    },
    addUserToGroupSuccess: (state, action) => {
      state.add.isFetching = false;
      state.group.currGroup = action.payload;
    },
    addUserToGroupFailed: (state) => {
      state.add.isFetching = false;
      state.add.error = true;
    },
    removeUserFromGoupStart: (state) => {
      state.remove.isFetching = true;
    },
    removeUserFromGroupSuccess: (state, action) => {
      state.remove.isFetching = false;
      state.group.currGroup = action.payload;
    },
    removeUserFromGroupFailed: (state) => {
      state.remove.isFetching = false;
      state.remove.error = true;
    },
  },
});

export const {
  accessStart,
  accessSuccess,
  accessFailed,
  fetchStart,
  fetchSuccess,
  fetchFailed,
  createGroupFailed,
  createGroupStart,
  createGroupSuccess,
  addUserToGroupFailed,
  addUserToGroupStart,
  addUserToGroupSuccess,
  removeUserFromGoupStart,
  removeUserFromGroupFailed,
  removeUserFromGroupSuccess,
} = chatSlice.actions;
export default chatSlice.reducer;
