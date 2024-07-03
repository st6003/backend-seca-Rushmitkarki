const path = require("path");
const doctorModel = require("../models/doctorModel");
const Doctor = require("../models/doctorModel");

const fs = require("fs");

const createDoctor = async (req, res) => {
  //  checking incomming data
  console.log(req.body);
  console.log(req.file);

  // descructuring data
  const { doctorName, doctorField, doctorExperience, doctorFee } = req.body;

  //  validation
  if (!doctorName || !doctorField || !doctorExperience || !doctorFee) {
    return res.ststus(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }
  // validate if there is image
  if (!req.files || !req.files.doctorImage) {
    return res.status(400).json({
      success: false,
      message: "Please upload an image...",
    });
  }
  const { doctorImage } = req.files;

  // uploade image
  // generate new imgae name
  const imageName = `${Date.now()}-${doctorImage.name}`;
  // path for image
  const imageUploadPath = path.join(
    __dirname,
    `../public/doctors/${imageName}`
  );

  try {
    await doctorImage.mv(imageUploadPath);
    // save to database
    const newDoctor = new doctorModel({
      doctorName: doctorName,
      doctorField: doctorField,
      doctorExperience: doctorExperience,
      doctorFee: doctorFee,
      doctorImage: imageName,
    });
    const doctor = await newDoctor.save();
    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
//  fetch all doctors
const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await doctorModel.find({});
    res.status(200).json({
      success: true,
      message: "All doctors fetched successfully",
      doctor: allDoctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
// fetch single doctor
const getSingleDoctor = async (req, res) => {
  const doctorId = req.params.id;
  try {
    const doctor = await doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.status(201).json({
      success: true,
      message: "Doctor fatched successfully",
      doctor: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    await doctorModel.findByIdAndDelete(req.params.id);
    res.status(201).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
// update doctor
const updateDoctor = async (req, res) => {
  try {
    if (req.files && req.files.doctorImage) {
      const { doctorImage } = req.files;
      const imageName = `${Date.now()}-${doctorImage.name}`;
      const imageUploadPath = path.join(
        __dirname,
        `../public/doctors/${imageName}`
      );
      await doctorImage.mv(imageUploadPath);
      req.body.doctorImage = imageName;

      if (req.body.doctorImage) {
        const existingDoctor = await doctorModel.findById(req.params.id);
        const oldImagePath = path.join(
          __dirname,
          `../public/doctors/${existingDoctor.doctorImage}`
        );
        fs.unlinkSync(oldImagePath);
      }
    }
    // update the data
    const updateDoctor = await doctorModel.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updateDoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};
// pagination
const paginationDoctors = async (req, res) => {
 

  try {
     // page no
  const PageNo = req.query.page || 1;
  // per page count
  const resultPerPage = req.query.limit || 2;
    // find all doctors, skip , limit
    const doctors = await doctorModel
      .find({})
      .skip((PageNo - 1) * resultPerPage)
      .limit(resultPerPage);
    // if thepage 6 is requested result 0
    if (doctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No doctors found",
      });
    }
    // send response
    res.status(200).json({
      success: true,
      message: "Doctors fetched successfully",
      doctors: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:error,
    });
  }
};
const getDoctorCount = async (req, res) => {
  try {
    const doctorCount = await doctorModel.countDocuments({});

    res.status(200).json({
      success: true,
      message: 'Doctor count fetched successfully',
      doctorCount: doctorCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getSingleDoctor,
  deleteDoctor,
  updateDoctor,
  paginationDoctors,
  getDoctorCount,
};
