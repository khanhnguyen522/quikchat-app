import { createSlice } from "@reduxjs/toolkit";

/** ------- helpers ------- */
const toId = (x) => String(x?._id ?? x?.id ?? x ?? "");
const getTime = (c) =>
  new Date(c?.latestMessage?.createdAt || c?.updatedAt || 0).getTime();

const sortByRecencyDesc = (arr) => arr.sort((a, b) => getTime(b) - getTime(a));

const sanitizeChat = (chat) => {
  // ensure updatedAt so new chats sort correctly even w/o latestMessage
  if (!chat?.updatedAt && chat?.latestMessage?.createdAt) {
    return { ...chat, updatedAt: chat.latestMessage.createdAt };
  }
  if (!chat?.updatedAt) {
    return { ...chat, updatedAt: new Date().toISOString() };
  }
  return chat;
};

const upsertChat = (state, chat) => {
  const list = state.fetch.allChats;
  const incoming = sanitizeChat(chat);

  if (!Array.isArray(list) || !list.length) {
    state.fetch.allChats = [incoming];
    return;
  }

  const id = toId(incoming);
  const idx = list.findIndex((c) => toId(c) === id);
  if (idx >= 0) {
    const existing = list[idx];
    const newer =
      getTime(incoming) >= getTime(existing)
        ? { ...existing, ...incoming }
        : existing;
    list[idx] = newer;
  } else {
    list.unshift(incoming);
  }

  sortByRecencyDesc(list);
};

const newerChat = (a, b) => (getTime(a) >= getTime(b) ? a : b);

/** ------- initial state ------- */
const initialState = {
  access: { chat: null, isFetching: false, error: false },
  fetch: { allChats: [], isFetching: false, error: false },
  group: { currGroup: null, isFetching: false, error: false },
  remove: { isFetching: false, error: false },
  add: { isFetching: false, error: false },
  getById: { isFetching: false, error: false },
  viewedAt: {}, // optional last viewed timestamps
  unreadCounts: {}, // NEW: chatId -> integer
};

/** ------- slice ------- */
export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /** handy public upsert for socket "chat:created"/"chat:updated" usage */
    addOrUpdateChat: (s, a) => {
      upsertChat(s, a.payload);
    },

    /** remove (e.g., kicked or chat deleted) */
    removeChatById: (s, a) => {
      const chatId = String(a.payload);
      s.fetch.allChats = (s.fetch.allChats || []).filter(
        (c) => toId(c) !== chatId
      );
      if (s.access.chat && toId(s.access.chat) === chatId) {
        s.access.chat = null;
      }
      if (s.group.currGroup && toId(s.group.currGroup) === chatId) {
        s.group.currGroup = null;
      }
      delete s.viewedAt?.[chatId];
      delete s.unreadCounts?.[chatId];
    },

    // track last viewed time (used for divider/unread if you want)
    setViewedAt: (s, { payload }) => {
      const { chatId, at } = payload;
      s.viewedAt = s.viewedAt || {};
      s.viewedAt[String(chatId)] = at || new Date().toISOString();
    },

    // NEW: unread counters
    incrementUnread: (s, { payload }) => {
      const chatId = String(payload);
      const curr = s.unreadCounts?.[chatId] ?? 0;
      s.unreadCounts[chatId] = curr + 1;
    },
    resetUnread: (s, { payload }) => {
      const chatId = String(payload);
      s.unreadCounts[chatId] = 0;
    },
    setUnreadCount: (s, { payload }) => {
      const { chatId, count } = payload || {};
      s.unreadCounts[String(chatId)] = Math.max(0, Number(count) || 0);
    },

    // access
    accessStart: (s) => {
      s.access.isFetching = true;
      s.access.error = false;
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
      s.fetch.error = false;
    },
    fetchSuccess: (s, a) => {
      const incomingList = Array.isArray(a.payload) ? a.payload : [];
      if (!s.fetch.allChats.length) {
        s.fetch.isFetching = false;
        s.fetch.allChats = sortByRecencyDesc(incomingList.map(sanitizeChat));
        return;
      }
      const map = new Map(s.fetch.allChats.map((c) => [toId(c), c]));
      for (const raw of incomingList) {
        const chat = sanitizeChat(raw);
        const id = toId(chat);
        const existing = map.get(id);
        if (!existing) map.set(id, chat);
        else map.set(id, newerChat(existing, chat));
      }
      s.fetch.isFetching = false;
      s.fetch.allChats = sortByRecencyDesc(Array.from(map.values()));
    },
    fetchFailed: (s) => {
      s.fetch.isFetching = false;
      s.fetch.error = true;
    },

    // groups
    createGroupStart: (s) => {
      s.group.isFetching = true;
      s.group.error = false;
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

    // add user to group
    addUserToGroupStart: (s) => {
      s.add.isFetching = true;
      s.add.error = false;
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

    // remove user from group
    removeUserFromGoupStart: (s) => {
      s.remove.isFetching = true;
      s.remove.error = false;
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

    // get by id
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

    // latest message + bump to top
    setLatestMessageAndBump: (state, { payload }) => {
      const { chatId, message, updatedAt } = payload;
      const list = state.fetch.allChats;
      if (!Array.isArray(list)) return;

      const id = String(chatId);
      const idx = list.findIndex((c) => toId(c) === id);

      const patch = {
        latestMessage: message,
        updatedAt: updatedAt || new Date().toISOString(),
      };

      if (idx === -1) {
        // create a minimal shell so list updates immediately
        list.unshift(
          sanitizeChat({
            _id: id,
            users: message?.chat?.users || [],
            chatName: message?.chat?.chatName || "Chat",
            isGroupChat: !!message?.chat?.isGroupChat,
            ...patch,
          })
        );
      } else {
        list[idx] = { ...list[idx], ...patch };
        // move to front
        const [item] = list.splice(idx, 1);
        list.unshift(item);
      }

      sortByRecencyDesc(list);
    },

    resetChatState: () => initialState,
  },
});

export const {
  addOrUpdateChat,
  removeChatById,
  setViewedAt,
  incrementUnread, // NEW
  resetUnread, // NEW
  setUnreadCount, // NEW
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
