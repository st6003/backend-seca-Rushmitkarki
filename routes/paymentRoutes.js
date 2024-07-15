// paymentRoutes.js
const express = require("express");
const router = express.Router();
const khaltiRoutes = require("./khaltiRoutes");

router.use("/khalti", khaltiRoutes);

module.exports = router;
