// controllers/messageController.js
const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const ensureMember = async (chatId, userId) => {
  const chat = await Chat.findById(chatId).select("users");
  if (!chat) return { ok: false, code: 404 };
  const ok = chat.users.some((u) => String(u) === String(userId));
  return { ok, code: ok ? 200 : 403 };
};

const messageController = {
  sendMessage: asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // 🛡️ enforce membership
    const mem = await ensureMember(chatId, req.user._id ?? req.user.id);
    if (!mem.ok) {
      return res
        .status(mem.code)
        .json({ message: "Not a member of this chat" });
    }

    // create message
    let msg = await Message.create({
      sender: req.user._id ?? req.user.id,
      content,
      chat: chatId,
    });

    // populate relations for frontend
    msg = await msg.populate([
      { path: "sender", select: "name pic email" },
      { path: "chat", select: "_id users isGroupChat chatName" },
    ]);
    msg = await msg.populate({ path: "chat.users", select: "name pic email" });

    // bump latestMessage + updatedAt on the chat (store ObjectId for latestMessage)
    await Chat.findByIdAndUpdate(chatId, {
      $set: { latestMessage: msg._id, updatedAt: new Date() },
    });

    // broadcast to room (server emits authoritative message)
    const io = req.app.get("io");
    io.to(String(chatId)).emit("message:new", msg);

    return res.status(201).json(msg);
  }),

  allMessages: asyncHandler(async (req, res) => {
    const { chatId } = { chatId: req.params.chatId };
    // 🛡️ enforce membership
    const mem = await ensureMember(chatId, req.user._id ?? req.user.id);
    if (!mem.ok) {
      return res
        .status(mem.code)
        .json({ message: "Not a member of this chat" });
    }

    let messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    messages = await User.populate(messages, {
      path: "chat.users",
      select: "name email pic",
    });

    res.status(200).json(messages);
  }),
};

module.exports = messageController;
