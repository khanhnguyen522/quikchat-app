import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeChatId: null,
  threads: {},
  send: { isFetching: false, error: false },
};

const ensureThread = (state, chatId) => {
  if (!state.threads[chatId]) {
    state.threads[chatId] = {
      items: [],
      isFetching: false,
      error: false,
      lastLoadedAt: null,
    };
  }
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setActiveChat(state, action) {
      state.activeChatId = action.payload || null;
    },

    getMessagesStartFor(state, action) {
      const chatId = action.payload;
      state.activeChatId = chatId;
      ensureThread(state, chatId);
      state.threads[chatId].isFetching = true;
      state.threads[chatId].error = false;
      // DO NOT clear items here to avoid UI flicker while refetching
      // state.threads[chatId].items = [];
    },
    getMessagesSuccessFor(state, action) {
      const { chatId, messages } = action.payload;
      ensureThread(state, chatId);
      state.threads[chatId].isFetching = false;
      state.threads[chatId].error = false;
      state.threads[chatId].items = messages;
      state.threads[chatId].lastLoadedAt = new Date().toISOString();
    },
    getMessagesFailedFor(state, action) {
      const chatId = action.payload;
      ensureThread(state, chatId);
      state.threads[chatId].isFetching = false;
      state.threads[chatId].error = true;
    },

    sendMessageStart(state) {
      state.send.isFetching = true;
      state.send.error = false;
    },

    sendMessageSuccess(state, action) {
      const { chatId, message } = action.payload;
      ensureThread(state, chatId);
      state.send.isFetching = false;

      const items = state.threads[chatId].items;

      // find if an optimistic message exists (same clientId)
      const optimisticIndex = items.findIndex(
        (m) => m.clientId && m.clientId === message.clientId
      );

      if (optimisticIndex !== -1) {
        // replace optimistic with the real one
        items[optimisticIndex] = message;
      } else {
        // if not found, push normally but avoid duplicates
        const exists = items.some(
          (m) =>
            (m._id && m._id === message._id) ||
            (m.clientId && m.clientId === message.clientId)
        );
        if (!exists) items.push(message);
      }
    },

    sendMessageFailed(state) {
      state.send.isFetching = false;
      state.send.error = true;
    },

    addOptimisticMessageFor(state, action) {
      const { chatId, tempMessage } = action.payload;
      ensureThread(state, chatId);
      state.threads[chatId].items.push(tempMessage);
    },

    removeOptimisticMessageFor(state, action) {
      const { chatId, clientId } = action.payload;
      ensureThread(state, chatId);
      state.threads[chatId].items = state.threads[chatId].items.filter(
        (m) => m.clientId !== clientId
      );
    },

    resetMessageState() {
      return initialState;
    },
  },
});

export const {
  setActiveChat,
  getMessagesStartFor,
  getMessagesSuccessFor,
  getMessagesFailedFor,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailed,
  addOptimisticMessageFor,
  removeOptimisticMessageFor,
  resetMessageState,
} = messageSlice.actions;

export default messageSlice.reducer;
