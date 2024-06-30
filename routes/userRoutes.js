const router = require("express").Router();
const userController = require("../controllers/userControllers");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", userController.loginUser);

// forget password
router.post("/forget_password", userController.forgotPassword);

// reset password
router.post("/reset_password", userController.resetPassword);

// Admin dashboard route

// Exporting the routes
module.exports = router;
