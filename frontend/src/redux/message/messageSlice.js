import { createSlice } from "@reduxjs/toolkit";

export const messageSlice = createSlice({
  name: "message",
  initialState: {
    getMessages: {
      allMessages: null,
      isFetching: false,
      error: false,
    },
    send: {
      isFetching: false,
      error: false,
    },
  },
  reducers: {
    getMessagesStart: (state) => {
      state.getMessages.isFetching = true;
    },
    getMessagesSuccess: (state, action) => {
      state.getMessages.isFetching = false;
      state.getMessages.allMessages = [action.payload];
      state.getMessages.error = false;
    },
    getMessagesFailed: (state) => {
      state.getMessages.isFetching = false;
      state.getMessages.error = true;
    },
    sendMessageStart: (state) => {
      state.send.isFetching = true;
    },
    sendMessageSuccess: (state, action) => {
      state.send.isFetching = false;
      state.getMessages.allMessages = state.getMessages.allMessages
        ? [...state.getMessages.allMessages, action.payload]
        : [action.payload];
      state.send.error = false;
    },
    sendMessageFailed: (state) => {
      state.send.isFetching = false;
      state.send.error = true;
    },
  },
});

export const {
  getMessagesStart,
  getMessagesSuccess,
  getMessagesFailed,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailed,
} = messageSlice.actions;
export default messageSlice.reducer;
