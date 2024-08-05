const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtp = require("../service/sendOtp");
const sendEmailOtp = require("../service/sendEmailOtp");
const { response } = require("express");
const User = require("../models/userModel");

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
  const { firstName, lastName, email, phone, password } = req.body;
  const id = req.user.id; // Assuming you have middleware to get userId from token

  if (!firstName || !lastName || !email || !phone) {
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

    if (password) {
      const randomSalt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, randomSalt);
    }

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
    const userId = req.params.id;
    const user = await user.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
      message: "please fill all the fields",
    });
  }
  try {
    const ticket = await client.verifyToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { email_verified, email, name, picture } = ticket.getPayload();
    let user = await userModel.findOne({ email: email });
    if (!user) {
      const { password } = req.body;
      const randomSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, randomSalt);
      const response = await axios.get(picture, { responseType: "stream" });
      const imageName = `${given_name}_${family_name}_${Date.now()}.png`;
      const imagePath = path.join(__dirname, `../public/profile/${imageName}`);

      const directoryPath = path.__dirname(imagePath);
      fs.mkdirSync(directoryPath, { recursive: true });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      user = new userModel({
        firstName: given_name,
        lastName: family_name,
        email: email,
        password: hashedPassword,
        image: imageName,
        googleId: true,
      });
      awaituser.save();
    }
    const jwtToken = await jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      (options = {
        expriesIn:
          Date.now() + process.env.JWT_TOKEN_EXPIRE * 24 * 60 * 60 * 1000 ||
          "1d",
      })
    );
    return res.status(201).json({
      success: true,
      message: "User Logged In Successfully!",
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
      error: error,
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
    const ticket = await client.verifyToken({
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
};
