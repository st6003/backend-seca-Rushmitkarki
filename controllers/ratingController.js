const Review = require("../models/reviewModel");

exports.addReview = async (req, res) => {
  const { doctorId, rating, comment } = req.body;
  const userId = req.user._id; // Assuming user ID is available in req.user

  try {
    const review = new Review({ doctorId, userId, rating, comment });
    await review.save();
    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error });
  }
};

exports.getReviewsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const reviews = await Review.find({ doctorId }).populate("userId", "name");
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error });
  }
};
