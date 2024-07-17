const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// create chats
const createChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  console.log("req.user:", req.user);

  try {
    // Find chat between the logged-in user and the specified user
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Populate the sender's information for the latest message
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "firstName lastName",
    });

    if (isChat.length > 0) {
      return res.status(200).send(isChat[0]);
    } else {
      // Create new chat if it doesn't exist
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      return res.status(200).send(fullChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// get chats

const getChats = async (req, res) => {
  console.log("req.user:", req.user);
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "firstName lastName email")
      .populate("groupAdmin", "firstName lastName email")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName",
        });
        res.status(200).json(results);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//  create group chat
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(400)
      .json({ success: false, message: "please fill all the fields" });
  }
  var users = JSON.parse(req.body.users);
  if (users.lenght < 2) {
    return res
      .status(400)
      .send("More than  2 users are required to find a group chat");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// renamegroup
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updateChat) {
      return res.status(400).json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(updateChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports = {
  createChat,
  getChats,
  createGroupChat,
  renameGroup,
};
