import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import chatReducer from "./chat/chatSlice";
import messageReducer from "./message/messageSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    message: messageReducer,
  },
});
