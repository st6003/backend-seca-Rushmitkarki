const router = require("express").Router();
const userController = require("../controllers/userControllers");

// Creating user resgistration route

router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", userController.loginUser);

// Controller (Export) -Routes (import)- use = ( index.js)

// Exporting the routes

module.exports = router;
