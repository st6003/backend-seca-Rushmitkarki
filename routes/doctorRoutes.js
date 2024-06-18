const router = require("express").Router();
const doctorControllers = require("../controllers/doctorControllers");
// const { authGuard } = require("../middlewares/authGuard");



// Route to create a doctor
router.post("/create", doctorControllers.createDoctor);

// Route to fetch all doctors
router.get("/get_all_doctors", doctorControllers.getAllDoctors);

// Route to fetch single doctor
router.get("/get_single_doctor/:id", doctorControllers.getSingleDoctor);

// Route to delete doctor by id
router.delete("/delete_doctor/:id", doctorControllers.deleteDoctor);

// Route to update a mobies by ID
router.put("/update_doctor/:id", doctorControllers.updateDoctor);

module.exports = router;
