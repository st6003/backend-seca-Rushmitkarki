// khaltiRoutes.js
const express = require("express");
const router = express.Router();
const {
  initializeKhalti,
  completeKhaltiPayment,
} = require("../controllers/paymentController");

router.post("/initialize-khalti", initializeKhalti);
router.get("/complete-khalti-payment", completeKhaltiPayment);

module.exports = router;
