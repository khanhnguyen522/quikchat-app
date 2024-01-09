const express = require("express");
const middlewareController = require("../controllers/middlewareController");
const chatController = require("../controllers/chatController");
const router = express.Router();

router.post("/", middlewareController.verifyToken, chatController.accessChat);
router.get("/", middlewareController.verifyToken, chatController.fetchChats);
router.post(
  "/group",
  middlewareController.verifyToken,
  chatController.createGroupChat
);
router.put(
  "/rename",
  middlewareController.verifyToken,
  chatController.renameGroup
);
router.put(
  "/groupadd",
  middlewareController.verifyToken,
  chatController.addToGroup
);
router.put(
  "/groupremove",
  middlewareController.verifyToken,
  chatController.removeFromGroup
);

module.exports = router;
