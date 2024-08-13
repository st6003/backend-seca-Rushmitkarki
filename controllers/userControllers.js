const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtp = require("../service/sendOtp");
const sendEmailOtp = require("../service/sendEmailOtp");
const { response } = require("express");
const user = require("../models/userModel");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const createUser = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists...",
      });
    }

    const randomsalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomsalt);

    const newUser = new userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// loginUser controller

const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found...",
      });
    }

    const isvalidPassword = await bcrypt.compare(password, user.password);
    if (!isvalidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      success: true,
      message: "Login successful...",
      token: token,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user._id,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error...",
    });
  }
};

// Forgot password function
const forgotPassword = async (req, res) => {
  console.log(req.body);

  const { contact, contactMethod } = req.body;

  if (!contact) {
    return res.status(400).json({
      success: false,
      message: "Please enter your phone number or email",
    });
  }

  let email, phone;

  if (contactMethod === "email") {
    email = contact;
  } else if (contactMethod === "phone") {
    phone = contact;
  } else {
    return res.status(400).json({
      success: false,
      message: "Please enter valid contact method",
    });
  }

  try {
    let user;
    if (phone) {
      user = await userModel.findOne({ phone: phone });
    } else if (email) {
      user = await userModel.findOne({ email: email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    console.log(randomOTP);

    user.resetPasswordOTP = randomOTP;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    let isSent;
    if (phone) {
      // Send OTP to user phone number
      isSent = await sendOtp(phone, randomOTP);
    } else if (email) {
      // Send OTP to user email
      isSent = await sendEmailOtp(email, randomOTP);
    }

    if (!isSent) {
      return res.status(400).json({
        success: false,
        message: "Error in sending OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your " + (phone ? "phone number" : "email"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password function
const resetPassword = async (req, res) => {
  console.log(req.body);

  const { contact, contactMethod, otp, password } = req.body;

  if (!contact || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  let email, phone;

  if (contactMethod === "email") {
    email = contact;
  } else if (contactMethod === "phone") {
    phone = contact;
  } else {
    return res.status(400).json({
      success: false,
      message: "Please enter valid contact method",
    });
  }

  try {
    let user;
    if (phone) {
      user = await userModel.findOne({ phone: phone });
    } else if (email) {
      user = await userModel.findOne({ email: email });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Otp to integer
    const otpToInteger = parseInt(otp);

    if (user.resetPasswordOTP !== otpToInteger) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomSalt);

    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single user
const getSingleUser = async (req, res) => {
  const id = req.user.id;
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await userModel.find({});
    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
// get token
const getToken = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "Token generated successfully!",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};
// verify user

// Update user profile
const updateUserProfile = async (req, res) => {
  const { firstName, lastName, email, phone, image } = req.body;
  const id = req.user.id;

  if (!firstName || !lastName || !email || !phone || !image) {
    return res.status(400).json({
      success: false,
      message: "Please enter all required fields",
    });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.image = image;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the request parameters
    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    // Assuming you have a function to find the user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Delete the user
    await userModel.deleteOne({ _id: userId });

    return res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// search users
const searchUsers = async (req, res) => {
  const { query } = req.query;
  const loggedInUserId = req.user._id;

  try {
    const users = await userModel
      .find({
        $or: [
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
        ],
        _id: { $ne: loggedInUserId },
      })
      .select("firstName lastName email");

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// login with google
const googleLogin = async (req, res) => {
  console.log(req.body);

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token",
    });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Token payload:", payload);

    const { email_verified, email, given_name, family_name, picture } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified by Google",
      });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      const response = await axios.get(picture, { responseType: "stream" });
      const imageName = `${given_name}_${family_name}_${Date.now()}.png`;
      const imagePath = path.join(
        __dirname,
        `../public/profile_pictures/${imageName}`
      );
      const writer = fs.createWriteStream(imagePath);

      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      user = new userModel({
        firstName: given_name,
        lastName: family_name,
        email,
        password: bcrypt.hashSync("defaultPassword", 10),
        image: imageName,
        googleId: payload.sub,
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      success: true,
      message: "User Logged In Successfully!",
      token: jwtToken,
      user: {
        firstName: given_name,
        lastName: family_name,
        email,
        picture,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error,
    });
  }
};

// get all user by google

const getUserByGoogleEmail = async (req, res) => {
  console.log(req.body);

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    console.log(ticket);

    const { email } = ticket.getPayload();
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(200).json({
        success: true,
        message: "User found",
        data: user,
      });
    }
    res.status(201).json({
      success: true,
      message: "User not found",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
const uploadProfilePicture = async (req, res) => {
  // const id = req.user.id;
  console.log(req.files);
  const { profilePicture } = req.files;

  if (!profilePicture) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image",
    });
  }

  //  Upload the image
  // 1. Generate new image name
  const imageName = `${Date.now()}-${profilePicture.name}`;

  // 2. Make a upload path (/path/upload - directory)
  const imageUploadPath = path.join(
    __dirname,
    `../public/profile_pictures/${imageName}`
  );

  // Ensure the directory exists
  const directoryPath = path.dirname(imageUploadPath);
  fs.mkdirSync(directoryPath, { recursive: true });

  try {
    // 3. Move the image to the upload path
    profilePicture.mv(imageUploadPath);

    //  send image name to the user
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      profilePicture: imageName,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
}; // update ptogilepicture

module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  getSingleUser,
  getAllUsers,
  getToken,
  deleteUser,
  searchUsers,
  googleLogin,
  getUserByGoogleEmail,
  uploadProfilePicture,
};
