const Favourite = require("../models/favouriteModel");

// Add item to favorites
exports.favorite = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.user.id;

    const { doctorId } = req.body;

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required!" });
    }

    const existingFavorite = await Favourite.findOne({
      doctorId: doctorId,
      userId: userId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Doctor already in favorites",
      });
    }

    const newFavorite = new Favourite({
      doctorId: doctorId,
      userId: userId,
    });

    await newFavorite.save();

    res.status(201).json({ success: true, message: "Doctor added to favorite" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all favorite items
exports.getAllFavorites = async (req, res) => {
  try {
    const favoriteItems = await Favourite.find();
    res.json(favoriteItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item from favorites
exports.deleteFavoriteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const favoriteItem = await Favourite.findOne({
      _id: id,
    });

    if (!favoriteItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    await Favourite.findByIdAndDelete(id);

    res.status(201).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
