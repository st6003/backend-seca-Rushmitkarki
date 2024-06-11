const router = require("express").Router();
const userController = require("../controllers/userControllers");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Creating user registration route
router.post("/create", userController.createUser);

// Creating user login route
router.post("/login", userController.loginUser);

// User dashboard route
router.get("/user-dashboard", authenticateToken, authorizeRoles('user'), (req, res) => {
  res.send('Welcome to the User Dashboard');
});

// Admin dashboard route
router.get("/admin-dashboard", authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.send('Welcome to the Admin Dashboard');
});

// Exporting the routes
module.exports = router;
