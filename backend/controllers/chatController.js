// controllers/chatController.js
const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");

const normalizeUsers = (users) => {
  try {
    if (typeof users === "string") {
      const parsed = JSON.parse(users);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return Array.isArray(users) ? users : [];
};

const populateChat = (q) =>
  q
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name pic email" },
    });

const chatController = {
  // 1:1 chat (create if not exists)
  accessChat: asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json("User ID param is not sent with request!");
    }

    let foundIds = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    }).select("_id");
    const found = await populateChat(
      Chat.find({ _id: { $in: foundIds.map((c) => c._id) } })
    );

    if (found.length > 0) {
      return res.status(200).json(found[0]);
    }

    // create new 1:1
    const created = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    });
    const fullChat = await populateChat(Chat.findById(created._id));

    // notify both users that a chat exists now
    const io = req.app.get("io");
    [req.user.id, userId].forEach((uid) =>
      io.to(String(uid)).emit("chat:created", fullChat)
    );

    return res.status(200).json(fullChat);
  }),

  // list my chats
  fetchChats: asyncHandler(async (req, res) => {
    const results = await populateChat(
      Chat.find({ users: { $elemMatch: { $eq: req.user.id } } }).sort({
        updatedAt: -1,
      })
    );
    return res.status(200).json(results);
  }),

  // get by id (only if member)
  getChatById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const chat = await populateChat(
      Chat.findOne({
        _id: id,
        users: { $elemMatch: { $eq: req.user.id } },
      }).select("chatName isGroupChat users groupAdmin latestMessage updatedAt")
    ).lean();

    if (!chat) {
      return res.status(404).json("Chat not found or no access.");
    }
    return res.status(200).json(chat);
  }),

  // create group
  createGroupChat: asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !req.body.users) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    let users = normalizeUsers(req.body.users);
    if (users.length < 2) {
      return res
        .status(400)
        .json("More than 2 users are required to form a group chat");
    }
    // include creator
    if (!users.some((u) => String(u) === String(req.user.id))) {
      users.push(req.user.id);
    }

    const group = await Chat.create({
      chatName: name,
      users,
      isGroupChat: true,
      groupAdmin: req.user.id,
    });

    const fullGroup = await populateChat(Chat.findById(group._id));

    // notify everyone
    const io = req.app.get("io");
    (fullGroup.users || []).forEach((u) =>
      io.to(String(u._id)).emit("chat:created", fullGroup)
    );

    return res.status(200).json(fullGroup);
  }),

  // rename group
  renameGroup: asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updated = await populateChat(
      Chat.findByIdAndUpdate(
        chatId,
        { chatName, updatedAt: new Date() },
        { new: true }
      )
    );

    if (!updated) return res.status(404).json("Chat not found");

    // broadcast the change
    const io = req.app.get("io");
    io.to(String(updated._id)).emit("chat:updated", updated);

    return res.status(200).json(updated);
  }),

  // add member
  addToGroup: asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await populateChat(
      Chat.findByIdAndUpdate(
        chatId,
        { $addToSet: { users: userId }, updatedAt: new Date() },
        { new: true }
      )
    );

    if (!added) return res.status(404).json("Chat not found");

    const io = req.app.get("io");
    io.to(String(added._id)).emit("chat:updated", added);
    io.to(String(userId)).emit("chat:created", added); // new member gets the chat

    return res.status(200).json(added);
  }),

  // remove member
  removeFromGroup: asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await populateChat(
      Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId }, updatedAt: new Date() },
        { new: true }
      )
    );

    if (!removed) return res.status(404).json("Chat not found");

    const io = req.app.get("io");
    io.to(String(removed._id)).emit("chat:updated", removed);
    io.to(String(userId)).emit("chat:removed", { chatId }); // tell kicked user

    return res.status(200).json(removed);
  }),
};

module.exports = chatController;
