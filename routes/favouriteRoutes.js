// routes/favouritesRoutes.js
 
const express = require("express");
const router = express.Router();
const favouritesController = require("../controllers/favouriteController");
const { authGuard } = require("../middleware/authGaurd");
 
// Route to add item to favorites
router.post("/add", authGuard, favouritesController.favorite);
 
// Route to get all favorite items
router.get("/all", favouritesController.getAllFavorites);
 
// Route to delete item from favorites
router.delete(
  "/delete/:id",
  authGuard,
  favouritesController.deleteFavoriteItem
);
 
module.exports = router;