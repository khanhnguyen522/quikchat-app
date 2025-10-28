import { io } from "socket.io-client";

let socket;

export const getSocket = (token) => {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // if token changes, refresh auth on next connect
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
      autoConnect: true,
    });
  } else if (socket.auth?.token !== token) {
    socket.auth = { token };
  }

  return socket;
};
