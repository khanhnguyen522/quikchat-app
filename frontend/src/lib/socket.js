// client/src/lib/socket.js
import { io } from "socket.io-client";
let socket;

export const getSocket = (token) => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
    });
    return socket;
  }

  // token changed? update and reconnect if needed
  if (socket.auth?.token !== token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }
  return socket;
};
