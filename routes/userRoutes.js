const router = require("express").Router();
const userController = require("../controllers/userControllers");
const { authGuard } = require("../middleware/authGaurd");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", userController.loginUser);

// forget password
router.post("/forget_password", userController.forgotPassword);

// reset password
router.post("/reset_password", userController.resetPassword);
// update profile
// Update user profile
router.put("/update_profile", authGuard, userController.updateUserProfile);

// Get single user
router.get("/get_single_user", authGuard, userController.getSingleUser);

// Get all users
router.get("/get_all_users", authGuard, userController.getAllUsers);

// Exporting the routes
module.exports = router;
