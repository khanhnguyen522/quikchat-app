const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const messageController = {
  sendMessage: asyncHandler(async (req, res) => {
    const { chatId, content } = req.body;

    if (!content || !chatId) {
      return res.status(400).json("Invalid data passed into request");
    }
    var newMessage = {
      sender: req.user.id,
      content: content,
      chat: chatId,
    };

    try {
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "-password");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });
      res.status(200).json(message);
    } catch (err) {
      return res.status(400).json(err.message);
    }
  }),

  allMessages: asyncHandler(async (req, res) => {
    try {
      var messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");

      messages = await User.populate(messages, {
        path: "chat.users",
        select: "name email pic",
      });

      res.status(200).json(messages);
    } catch (err) {
      return res.status(400).json(err.message);
    }
  }),
};

module.exports = messageController;
