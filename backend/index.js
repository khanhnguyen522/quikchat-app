const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
// const socketio = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/v1/user", userRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/message", messageRoutes);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("Connected to socket.io");

//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     console.log("User joined room: " + room);
//   });

//   socket.on("typing", (room) => socket.in(room).emit("typing"));
//   socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

//   socket.on("new message", (newMessageReceived) => {
//     var chat = newMessageReceived.chat;

//     if (!chat.users) {
//       return console.log("chat.users not defined");
//     }

//     chat.users.forEach((user) => {
//       if (user._id == newMessageReceived.sender._id) {
//         return;
//       }
//       socket.in(user._id).emit("message received", newMessageReceived);
//     });
//   });

//   socket.off("setup", () => {
//     console.log("User disconnected");
//     socket.leave(userData._id);
//   });
// });
