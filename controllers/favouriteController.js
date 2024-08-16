const Favourite = require("../models/favouriteModel");

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID is required!" });
    }

    const existingFavorite = await Favourite.findOne({
      doctor: doctorId,
      user: userId,
    });

    if (existingFavorite) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor already in favorites" });
    }

    const newFavorite = new Favourite({ doctor: doctorId, user: userId });
    await newFavorite.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Doctor added to favorites",
        newFavorite: newFavorite,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favoriteItems = await Favourite.find({ user: userId })
      .populate("doctor")
      .populate("user");
    res.status(200).json({
      success: true,
      favorites: favoriteItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteFavoriteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const favoriteItem = await Favourite.findOne({
      _id: id,
      user: userId,
    });

    if (!favoriteItem) {
      return res.status(404).json({ message: "Favorite item not found" });
    }

    await Favourite.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Item removed from favorites successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
