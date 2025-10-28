const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const messageController = {
  sendMessage: asyncHandler(async (req, res) => {
    try {
      const { content, chatId } = req.body;
      if (!content || !chatId) {
        return res.status(400).json({ message: "Invalid data" });
      }

      // create message (ensure your auth middleware sets req.user._id)
      let msg = await Message.create({
        sender: req.user._id ?? req.user.id,
        content,
        chat: chatId,
      });

      // populate relations for frontend
      msg = await msg.populate([
        { path: "sender", select: "name pic email" },
        { path: "chat", select: "_id users" },
      ]);
      msg = await msg.populate({
        path: "chat.users",
        select: "name pic email",
      });

      // bump latestMessage + updatedAt on the chat (store ObjectId for latestMessage)
      await Chat.findByIdAndUpdate(chatId, {
        $set: { latestMessage: msg._id, updatedAt: new Date() },
      });

      // broadcast to room (server emits authoritative message)
      const io = req.app.get("io");
      io.to(String(chatId)).emit("message:new", msg);

      return res.status(201).json(msg);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Server error" });
    }
  }),

  allMessages: asyncHandler(async (req, res) => {
    try {
      let messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");

      messages = await User.populate(messages, {
        path: "chat.users",
        select: "name email pic",
      });

      res.status(200).json(messages);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }),
};

module.exports = messageController;
