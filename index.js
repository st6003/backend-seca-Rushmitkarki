// Importing the packages
const express = require("express");

const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const acceptFormData = require("express-fileupload");

// const { authGuard } = require("../middlewares/authGuard");
// const {
//   initializeKhaltiPayment,
//   verifyKhaltiPayment,
// } = require("./routes/khalti");
// const Payment = require("./models/paymentModel");
// const PurchasedItem = require("./models/purchasedItemModel");
// const Item = require("./models/itemModel");

// Creating an express app
const app = express();

// Express JSON configuration
app.use(express.json());

// Dotenv configuration
dotenv.config();

// enable file uploade
// app.use(acceptFormData());

// Connecting to the database
connectDatabase();

//file public
app.use(express.static("./public"));

// Defining the PORT
const PORT = process.env.PORT;

// Accepting form data
app.use(acceptFormData());

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Defining routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/favourite", require("./routes/favouriteRoutes"));
app.use("/api/booking", require("./routes/doctorAppointmentRoute"));
app.use("/api/admin", require("./routes/adminRoutes"));
// app.use("/api/insurance",require("./routes/insuranceRoutes"));

// // for khalti api
// app.post("/initialize-khalti", async (req, res) => {
//   try {
//     //try catch for error handling
//     const { itemId, totalPrice, website_url } = req.body;
//     const itemData = await Item.findOne({
//       _id: itemId,
//       price: Number(totalPrice),
//     });

//     if (!itemData) {
//       return res.status(400).send({
//         success: false,
//         message: "item not found",
//       });
//     }
//     // creating a purchase document to store purchase info
//     const purchasedItemData = await PurchasedItem.create({
//       item: itemId,
//       paymentMethod: "khalti",
//       totalPrice: totalPrice * 100,
//     });

//     const paymentInitate = await initializeKhaltiPayment({
//       amount: totalPrice * 100, // amount should be in paisa (Rs * 100)
//       purchase_order_id: purchasedItemData._id, // purchase_order_id because we need to verify it later
//       purchase_order_name: itemData.name,
//       return_url: `${process.env.BACKEND_URL}`,
//       website_url,
//     });

//     res.json({
//       success: true,
//       purchasedItemData,
//       payment: paymentInitate,
//     });
//   } catch (error) {
//     console.error("Error in initialize-khalti", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//       error,
//     });
//   }
// });
// app.get("/complete-khalti-payment", async (req, res) => {
//   const {
//     pidx,
//     txnId,
//     amount,
//     mobile,
//     purchase_order_id,
//     purchase_order_name,
//     transaction_id,
//   } = req.query;

//   try {
//     const paymentInfo = await verifyKhaltiPayment(pidx);

//     // Check if payment is completed and details match
//     if (
//       paymentInfo?.status !== "Completed" ||
//       paymentInfo.transaction_id !== transaction_id ||
//       Number(paymentInfo.total_amount) !== Number(amount)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Incomplete information",
//         paymentInfo,
//       });
//     }

//     // Check if payment done in valid item
//     const purchasedItemData = await PurchasedItem.findOne({
//       _id: purchase_order_id,
//       totalPrice: amount,
//     });

//     if (!purchasedItemData) {
//       return res.status(400).send({
//         success: false,
//         message: "Purchased data not found",
//       });
//     }

//     // updating purchase record
//     await PurchasedItem.findByIdAndUpdate(
//       purchase_order_id,
//       { $set: { status: "completed" } },
//       { new: true }
//     );

//     // Create a new payment record
//     const paymentData = await Payment.findOneAndUpdate(
//       { transactionId: transaction_id },
//       {
//         pidx,
//         productId: purchase_order_id,
//         amount,
//         dataFromVerificationReq: paymentInfo,
//         apiQueryFromUser: req.query,
//         paymentGateway: "khalti",
//         status: "success",
//       },
//       { upsert: true, new: true }
//     );

//     // Send success response
//     res.json({
//       success: true,
//       message: "Payment Successful",
//       paymentData,
//     });
//   } catch (error) {
//     console.error("Error in complete-khalti-payment:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred",
//       error: error.message,
//     });
//   }
// });

// app.get("/create-item", async (req, res) => {
//   let itemData = await Item.create({
//     name: "Test2",
//     price: 1000,
//     inStock: true,
//     category: "Nice",
//   });
//   res.json({
//     success: true,
//     item: itemData,
//   });
// });


// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
