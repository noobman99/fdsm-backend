const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    deliveryBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: {
      type: [{ name: String, quantity: Number, price: Number }],
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
