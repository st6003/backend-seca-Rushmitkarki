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
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "firstName lastName",
    });

    if (isChat.length > 0) {
      return res.status(200).send(isChat[0]);
    } else {
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
      .sort({ updatedAt: -1 });

    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "firstName lastName",
    });

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// create group chat
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the fields" });
  }

  let users;
  try {
    users = JSON.parse(req.body.users);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid users format" });
  }

  if (users.length < 2) {
    return res
      .status(400)
      .json({ success: false, message: "More than 2 users are required to form a group chat" });
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

// rename group
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res
        .status(400)
        .json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(updatedChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// add to group
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          users: userId,
        },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(400).json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(added);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// remove from group
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          users: userId,
        },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(400).json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(removed);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// leave from group
const leaveFromGroup = async (req, res) => {

  const { chatId} = req.body;

  const { chatId, userId } = req.body;


  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {

          users: req.userId,

          users: userId,

        },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(400).json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(removed);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// updategroup
const updateGroup = async (req, res) => {
  const { chatId, chatName, users } = req.body;

  try {
    const updated = await Chat.findByIdAndUpdate
      (chatId,
        {
          chatName: chatName,
          users: users,
        },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
    if (!updated) {
      return res.status(400).json({ success: false, message: "Chat not found" });
    } else {
      res.status(200).send(updated);
    }
  
  }catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



module.exports = {
  createChat,
  getChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveFromGroup,

  updateGroup


};
