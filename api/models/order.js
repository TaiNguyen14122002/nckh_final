const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  OrderID:{
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  cartItems: [
    {
      Note:{
        type: String,
        required: true,
      },
      Price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      ticket_Name: {
        type: String,
        required: true,
      },
      Ticker_Code: {
        type: String,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  // shippingAddress: {
  //   name: {
  //     type: String,
  //     required: true,
  //   },
  //   mobileNo: {
  //     type: String,
  //     required: true,
  //   },
  //   houseNo: {
  //     type: String,
  //     required: true,
  //   },
  //   street: {
  //     type: String,
  //     required: true,
  //   },
  //   landmark: {
  //     type: String,
  //     required: true,
  //   },
  //   postalCode: {
  //     type: String,
  //     required: true,
  //   },
  // },
  Mail:{
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  DateTime:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
