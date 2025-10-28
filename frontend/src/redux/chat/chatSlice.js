import { createSlice } from "@reduxjs/toolkit";

const upsertChat = (state, chat) => {
  if (!state.fetch.allChats) {
    state.fetch.allChats = [chat];
    return;
  }

  const idx = state.fetch.allChats.findIndex((c) => c._id == chat._id);
  if (idx >= 0) {
    state.fetch.allChats[idx] = { ...state.fetch.allChats[idx], ...chat };
    state.fetch.allChats.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  } else {
    state.fetch.allChats.unshift(chat);
  }
};

const newerChat = (a, b) => {
  // pick the one with newer updatedAt / latestMessage.createdAt
  const aUpdated = a?.updatedAt || a?.latestMessage?.createdAt || 0;
  const bUpdated = b?.updatedAt || b?.latestMessage?.createdAt || 0;
  return new Date(aUpdated) > new Date(bUpdated) ? a : b;
};

const initialState = {
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
  getById: { isFetching: false, error: false },
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // access
    accessStart: (s) => {
      s.access.isFetching = true;
    },
    accessSuccess: (s, a) => {
      s.access.isFetching = false;
      s.access.chat = a.payload;
      upsertChat(s, a.payload);
    },
    accessFailed: (s) => {
      s.access.isFetching = false;
      s.access.error = true;
    },

    // list
    fetchStart: (s) => {
      s.fetch.isFetching = true;
    },
    fetchSuccess: (s, a) => {
      const incoming = Array.isArray(a.payload) ? a.payload : [];
      if (!s.fetch.allChats || !s.fetch.allChats.length) {
        s.fetch.isFetching = false;
        s.fetch.allChats = incoming;
        return;
      }

      // Build a map of current chats
      const map = new Map(s.fetch.allChats.map((c) => [c._id, c]));

      // Merge: if incoming has a chat, keep whichever is newer
      for (const chat of incoming) {
        const existing = map.get(chat._id);
        if (!existing) map.set(chat._id, chat);
        else map.set(chat._id, newerChat(existing, chat));
      }

      // Assign back, sorted by recency
      s.fetch.isFetching = false;
      s.fetch.allChats = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b?.updatedAt || b?.latestMessage?.createdAt || 0) -
          new Date(a?.updatedAt || a?.latestMessage?.createdAt || 0)
      );
    },
    fetchFailed: (s) => {
      s.fetch.isFetching = false;
      s.fetch.error = true;
    },

    // groups
    createGroupStart: (s) => {
      s.group.isFetching = true;
    },
    createGroupSuccess: (s, a) => {
      s.group.isFetching = false;
      s.group.currGroup = a.payload;
      upsertChat(s, a.payload);
    },
    createGroupFailed: (s) => {
      s.group.isFetching = false;
      s.group.error = true;
    },

    //add user to group
    addUserToGroupStart: (s) => {
      s.add.isFetching = true;
    },
    addUserToGroupSuccess: (s, a) => {
      s.add.isFetching = false;
      s.group.currGroup = a.payload;
      upsertChat(s, a.payload);
    },
    addUserToGroupFailed: (s) => {
      s.add.isFetching = false;
      s.add.error = true;
    },

    //remove user from group
    removeUserFromGoupStart: (s) => {
      s.remove.isFetching = true;
    },
    removeUserFromGroupSuccess: (s, a) => {
      s.remove.isFetching = false;
      s.group.currGroup = a.payload;
      upsertChat(s, a.payload);
    },
    removeUserFromGroupFailed: (s) => {
      s.remove.isFetching = false;
      s.remove.error = true;
    },

    //get by id
    getByIdStart: (s) => {
      s.getById.isFetching = true;
      s.getById.error = false;
    },
    getByIdSuccess: (s, a) => {
      s.getById.isFetching = false;
      upsertChat(s, a.payload);
    },
    getByIdFailed: (s) => {
      s.getById.isFetching = false;
      s.getById.error = true;
    },

    //set latest message for chat list
    setLatestMessageAndBump: (state, { payload }) => {
      const { chatId, message, updatedAt } = payload;
      const list = state.fetch.allChats;
      if (!Array.isArray(list)) return;

      const idx = list.findIndex((c) => c._id == chatId);
      if (idx === -1) return;

      const updatedChat = {
        ...list[idx],
        latestMessage: message,
        updatedAt: updatedAt || new Date().toISOString(),
      };
      list.splice(idx, 1);
      list.unshift(updatedChat);
    },
    resetChatState: () => initialState,
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
  getByIdStart,
  getByIdSuccess,
  getByIdFailed,
  setLatestMessageAndBump,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
