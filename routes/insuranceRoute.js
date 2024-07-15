const router = require("express").Router();
const insuranceControllers = require("../controllers/insuranceController");

// Route to create insurance
router.post("/create", insuranceControllers.createInsurance);
// Route to get all insurances
router.get("/get_all_insurances", insuranceControllers.getAllInsurance);
// Route to get single insurance
router.get("/get_single_insurance/:id", insuranceControllers.getInsurance);
// Route to delete insurance by id
router.delete("/delete_insurance/:id", insuranceControllers.deleteInsurance);
// Route to update insurance by ID
router.put("/update_insurance/:id", insuranceControllers.updateInsurance);

module.exports = router;
