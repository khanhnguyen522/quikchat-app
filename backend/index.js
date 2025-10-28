const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();

const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/v1/user", userRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/message", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

// expose io to controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // client should call socket.emit("user:join", { userId })
  socket.on("user:join", ({ userId }) => {
    if (!userId) return;
    socket.join(String(userId));
  });

  socket.on("chat:join", ({ chatId }) => {
    if (!chatId) return;
    socket.join(String(chatId));
  });

  socket.on("chat:leave", ({ chatId }) => {
    if (!chatId) return;
    socket.leave(String(chatId));
  });

  // IMPORTANT: Do NOT accept client-originated "message:new" to rebroadcast.
  // Authoritative emits happen from the message controller after DB persist.

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
