const axios = require("axios");
const Payment = require("../models/paymentModel");
const PurchasedItem = require("../models/purchasedItemModel");
const Insurance = require("../models/insuranceModel");

// Function to verify Khalti Payment
const verifyKhaltiPayment = async (pidx) => {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({ pidx });

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/verify/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return response.data;
  } catch (error) {
    console.error(
      "Error verifying Khalti payment:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Function to initialize Khalti Payment
const initializeKhaltiPayment = async (details) => {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({
    return_url: details.website_url + "/payment/success",
    website_url: details.website_url,
    amount: details.amount, // Amount in paisa
    purchase_order_id: details.itemId,
    purchase_order_name: "Insurance Purchase",
  });

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return {
      success: true,
      payment_url: response.data.payment_url, // Assuming Khalti API returns `payment_url`
    };
  } catch (error) {
    console.error(
      "Error initializing Khalti payment:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Route handler to initialize Khalti payment
const initializeKhalti = async (req, res) => {
  try {
    const { itemId, totalPrice } = req.body;

    // Verify item data using the correct model (Insurance in your case)
    const insuranceData = await Insurance.findById(itemId);
    if (!insuranceData || insuranceData.insurancePrice * 100 !== totalPrice) {
      // Ensure the price match
      return res.status(400).json({
        success: false,
        message: "Insurance not found or price mismatch",
      });
    }

    // Create a purchase document to store purchase info
    const purchasedItemData = await PurchasedItem.create({
      item: itemId,
      paymentMethod: "khalti",
      totalPrice: totalPrice,
    });

    // Initialize Khalti payment
    const paymentInitiate = await initializeKhaltiPayment({
      amount: totalPrice, // Ensure this is in paisa
      itemId: purchasedItemData._id,
      website_url: req.body.website_url,
    });

    res.json({
      success: true,
      payment_url: paymentInitiate.payment_url, // Return the payment URL to frontend
    });
  } catch (error) {
    console.error("Error initializing Khalti payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while initializing Khalti payment",
      error: error.message,
    });
  }
};

// Route handler to complete Khalti payment
const completeKhaltiPayment = async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query;

  try {
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete information",
        paymentInfo,
      });
    }

    // Check if payment done in valid item
    const purchasedItemData = await PurchasedItem.findOne({
      _id: purchase_order_id,
      totalPrice: amount,
    });

    if (!purchasedItemData) {
      return res.status(400).send({
        success: false,
        message: "Purchased data not found",
      });
    }

    // Update purchase record status to completed
    await PurchasedItem.findByIdAndUpdate(
      purchase_order_id,
      { $set: { status: "completed" } },
      { new: true }
    );

    // Create or update payment record
    const paymentData = await Payment.findOneAndUpdate(
      { transactionId: transaction_id },
      {
        pidx,
        productId: purchase_order_id,
        amount,
        dataFromVerificationReq: paymentInfo,
        apiQueryFromUser: req.query,
        paymentGateway: "khalti",
        status: "success",
      },
      { upsert: true, new: true }
    );

    // Send success response
    res.json({
      success: true,
      message: "Payment Successful",
      paymentData,
    });
  } catch (error) {
    console.error("Error in complete-khalti-payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

module.exports = {
  initializeKhaltiPayment,
  verifyKhaltiPayment,
  initializeKhalti,
  completeKhaltiPayment,
};
