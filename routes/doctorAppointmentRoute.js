const router = require("express").Router();
const doctorAppointmentControllers = require("../controllers/doctorAppointmentController");

// Route to create a doctor appointment
router.post("/create", doctorAppointmentControllers.createDoctorAppointment);
// Route to get all doctor appointments
// router.get("/get_all_doctor_appointments", doctorAppointmentControllers.getAllDoctorAppointments);
// // Route to get single doctor appointment
// router.get("/get_single_doctor_appointment/:id", doctorAppointmentControllers.getSingleDoctorAppointment);
// // Route to delete doctor appointment by id
// router.delete("/delete_doctor_appointment/:id", doctorAppointmentControllers.deleteDoctorAppointment);
// // Route to update a doctor appointment by ID
// router.put("/update_doctor_appointment/:id", doctorAppointmentControllers.updateDoctorAppointment);
// // pagination
// router.get("/pagination", doctorAppointmentControllers.paginationDoctorAppointments);
// // get doctor appointment count
// router.get("/get_doctor_appointment_count", doctorAppointmentControllers.getDoctorAppointmentCount);
// // get doctor appointment count by status
// router.get("/get_doctor_appointment_count_by_status", doctorAppointmentControllers.getDoctorAppointmentCountByStatus);



module.exports=router;
