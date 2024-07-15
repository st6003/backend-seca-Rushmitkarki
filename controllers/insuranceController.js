const path = require('path');
const Insurance = require('../models/insuranceModel');
const fs = require("fs");

const createInsurance = async (req, res) => {
    console.log(req.body);
    console.log(req.files);
  const { insuranceName, insurancePrice, insuranceDescription } = req.body;

  if (!insuranceName || !insurancePrice || !insuranceDescription) {
    return res.status(400).json({
      success: false,
      message: 'Please enter all the fields...',
    });
  }
//   validate image
    if (!req.files || !req.files.insuranceImage) {
        return res.status(400).json({
        success: false,
        message: 'Please upload an image...',
        });
    }
    const { insuranceImage } = req.files;

    const imageName = `${Date.now()}-${insuranceImage.name}`;
    const imageUploadPath = path.join(__dirname, `../public/insurance/${imageName}`);
    try {
        await insuranceImage.mv(imageUploadPath);
        const newInsurance = new Insurance({
            insuranceName,
            insurancePrice,
            insuranceDescription,
            insuranceImage: imageName,
        });
        const insurance = await newInsurance.save();
        res.status(201).json({
            success: true,
            message: 'Insurance created successfully',
            data: insurance,
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

// Fetch all insurance
const getAllInsurance = async (req, res) => {
    try {
      const allinsurance = await Insurance.find({});
      res.status(200).json({
        success: true,
        message: 'Insurance fetched successfully',
        data: allinsurance,
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

// Fetch single insurance
const getInsurance = async (req, res) => {
    const insuranceId = req.params.id;
    try {
      const insurance = await Insurance.findById(insuranceId);
      if (!insurance) {
        return res.status(400).json({
          success: false,
          message: 'Insurance not found',
        });
      }
      res.status(201).json({
        success: true,
        message: 'Insurance fetched successfully',
        data: insurance,
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

// Delete insurance
const deleteInsurance = async (req, res) => {
    try {
        const insurance = await Insurance.findByIdAndDelete(req.params.id);
        if (insurance && insurance.insuranceImage) {
            const imagePath = path.join(__dirname, `../public/insurance/${insurance.insuranceImage}`);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Insurance deleted successfully',
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

// Update insurance
const updateInsurance = async (req, res) => {
    try {
      if (req.files && req.files.insuranceImage) {
        const { insuranceImage } = req.files;
        const imageName = `${Date.now()}-${insuranceImage.name}`;
        const imageUploadPath = path.join(
          __dirname,
          `../public/insurance/${imageName}`
        );
        await insuranceImage.mv(imageUploadPath);
        req.body.insuranceImage = imageName;
  
        if (req.body.insuranceImage) {
          const existingInsurance = await Insurance.findById(req.params.id);
          const oldImagePath = path.join(
            __dirname,
            `../public/insurance/${existingInsurance.insuranceImage}`
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }
  
      // Update the data
      const updatedInsurance = await Insurance.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
  
      res.status(201).json({
        success: true,
        message: "Insurance updated successfully",
        data: updatedInsurance,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error
      });
    }
};

module.exports = { createInsurance, deleteInsurance, updateInsurance, getAllInsurance, getInsurance };
