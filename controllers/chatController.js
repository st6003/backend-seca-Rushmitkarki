const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

const createChat = async (req, res) => {
  const { userIds } = req.body;

  try {
    const chat = new Chat({ participants: userIds });
    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getChats = async (req, res) => {
  const { userId } = req.params;

  try {
    const chats = await Chat.find({ participants: userId }).populate("participants", "firstName lastName email").populate("lastMessage");

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createChat,
  getChats,
};
