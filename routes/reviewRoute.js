const express = require("express");
const { addReview, getReviewsByDoctor } = require("../controllers/ratingController");
const { authGuard } = require("../middleware/authGaurd");

const router = express.Router();

router.post("/add", authGuard, addReview);
router.get("/doctor/:doctorId", getReviewsByDoctor);

module.exports = router;
