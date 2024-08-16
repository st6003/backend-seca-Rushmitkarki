const path = require("path");
const doctorModel = require("../models/doctorModel");
const Doctor = require("../models/doctorModel");

const fs = require("fs");

const createDoctor = async (req, res) => {
  // Checking incoming data
  console.log(req.body);
  console.log(req.files);

  // Destructuring data
  const { doctorName, doctorField, doctorExperience, doctorFee } = req.body;

  // Validation
  if (!doctorName || !doctorField || !doctorExperience || !doctorFee) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  var imageName = null;

  try {
    // Validate if there is an image
    if (req.files && req.files.doctorImage) {
      const { doctorImage } = req.files;

      // Upload image
      // Generate new image name
      const imageName = `${Date.now()}-${doctorImage.name}`;
      // Path for image
      const imageUploadPath = path.join(
        __dirname,
        `../public/doctors/${imageName}`
      );
      // Move the uploaded file to the desired location
      await doctorImage.mv(imageUploadPath);
    }

    // Save to database
    const newDoctor = new doctorModel({
      doctorName,
      doctorField,
      doctorExperience,
      doctorFee,
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
      error,
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
    const doctor = await doctorModel.findById(doctorId);
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
  // try {
  //   const doctor = await doctorModel.findById(req.params.id);
  //   if (!doctor) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Doctor not found",
  //     });
  //   }
  //   if (req.files && req.files.doctorImage) {
  //     const { doctorImage } = req.files;
  //     const imageName = `${Date.now()}-${doctorImage.name}`;
  //     const imageUploadPath = path.join(
  //       __dirname,
  //       `../public/doctors/${imageName}`
  //     );
  //     await doctorImage.mv(imageUploadPath);
  //     req.body.doctorImage = imageName;
  //     if (req.body.doctorImage) {
  //       const existingDoctor = await doctorModel.findById(req.params.id);
  //       imagepath = path.join(
  //         __dirname,
  //         `../public/doctors/${existingDoctor.doctorImage}`
  //       );
  //       fs.unlinkSync(imagepath);
  //     }
  //   }
  //   const updateDoctor = await doctorModel.findByIdAndUpdate(
  //     req.params.id,
  //     req.body
  //   );
  //   res.status(201).json({
  //     success: true,
  //     message: "Doctor updated successfully",
  //     doctor: updateDoctor,
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({
  //     success: false,
  //     message: "Internal server error",
  //     error: error,
  //   });
  // }
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
    const PageNo = parseInt(req.query.page) || 1;
    // per page count
    const resultPerPage = parseInt(req.query.limit) || 2;

    // Search query
    const searchQuery = req.query.q || "";
    const sortOrder = req.query.sort || "asc";

    const filter = {};
    if (searchQuery) {
      filter.doctorName = { $regex: searchQuery, $options: "i" };
    }

    // Sorting
    const sort = sortOrder === "asc" ? { doctorFee: 1 } : { doctorFee: -1 };

    // Find doctors with filters, pagination, and sorting
    const doctors = await doctorModel
      .find(filter)
      .skip((PageNo - 1) * resultPerPage)
      .limit(resultPerPage)
      .sort(sort);

    // If the requested page has no results
    if (doctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No doctors found",
      });
    }

    // Send response
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
      error: error,
    });
  }
};

const getDoctorCount = async (req, res) => {
  try {
    const doctorCount = await doctorModel.countDocuments({});

    res.status(200).json({
      success: true,
      message: "Doctor count fetched successfully",
      doctorCount: doctorCount,
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
// const searchDoctor = async (req, res) => {
//   const searchQuery = req.query.q || '';
//   const searchFee = req.query.fee || '';
//   const sortOrder = req.query.sort || 'asc';

//   try {
//     const filter = {};
//     if (searchQuery) {
//       filter.doctorName = { $regex: searchQuery, $options: 'i' };
//     }
//     if (searchFee) {
//       filter.doctorFee = { $regex: searchFee, $options: 'i' };
//     }
//     const sort = sortOrder === 'asc' ? { doctorFee: 1 } : { doctorFee: -1 };
//     const doctors = await Doctor.find(filter).sort(sort);

//     res.status(201).json({
//       success: true,
//       message: 'Doctors fetched successfully',
//       doctors: doctors,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

module.exports = {
  createDoctor,
  getAllDoctors,
  getSingleDoctor,
  deleteDoctor,
  updateDoctor,
  paginationDoctors,
  getDoctorCount,
};
