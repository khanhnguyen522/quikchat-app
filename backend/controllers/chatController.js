const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const chatController = {
  accessChat: asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json("User ID param is not sent with request!");
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    console.log(isChat.length);

    if (isChat.length > 0) {
      res.status(200).send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user.id, userId],
      };
      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );

        res.status(200).send(fullChat);
      } catch (err) {
        return res.status(400).json(err.message);
      }
    }
  }),

  fetchChats: asyncHandler(async (req, res) => {
    try {
      await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });

          return res.status(200).json(results);
        });
    } catch (err) {
      return res.status(400).json(err.message);
    }
  }),

  createGroupChat: asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res
        .status(400)
        .json("More than 2 users are required to form a group chat");
    }
    users.push(req.user.id);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user.id,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "--password")
        .populate("groupAdmin", "-password");

      console.log(fullGroupChat);

      return res.status(200).json(fullGroupChat);
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  }),

  renameGroup: asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json("Chat not found");
    } else {
      return res.status(200).json(updatedChat);
    }
  }),

  addToGroup: asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).json("Chat not found");
    } else {
      return res.status(200).json(added);
    }
  }),

  removeFromGroup: asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).json("Chat not found");
    } else {
      return res.status(200).json(removed);
    }
  }),
};

module.exports = chatController;
