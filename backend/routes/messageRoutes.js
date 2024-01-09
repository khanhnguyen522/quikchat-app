const express = require("express");
const middlewareController = require("../controllers/middlewareController");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.post(
  "/",
  middlewareController.verifyToken,
  messageController.sendMessage
);
router.get(
  "/:chatId",
  middlewareController.verifyToken,
  messageController.allMessages
);

module.exports = router;
