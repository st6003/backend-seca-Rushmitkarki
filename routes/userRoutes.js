const router = require("express").Router();
const userController = require("../controllers/userControllers");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", userController.loginUser);

// Admin dashboard route

// Exporting the routes
module.exports = router;
