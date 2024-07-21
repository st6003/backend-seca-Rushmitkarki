// routes/favouriteRoutes.js

const express = require("express");
const router = express.Router();
const favouritesController = require("../controllers/favouriteController");
const { authGuard } = require("../middleware/authGaurd");

router.post("/add", authGuard, favouritesController.addFavorite);
router.get("/all", authGuard, favouritesController.getUserFavorites);
router.delete("/delete/:id", authGuard, favouritesController.deleteFavoriteItem);

module.exports = router;