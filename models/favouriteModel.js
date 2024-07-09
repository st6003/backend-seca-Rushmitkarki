const mongoose = require("mongoose");
 
const favouriteSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "doctors" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // If user-specific favorites are needed
});
 
const Favourite = mongoose.model("Favourite", favouriteSchema);
 
module.exports = Favourite;