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
    deliveryAddress: {
      type: String,
      required: true,
    },
    isPaid: {
      type: int, // 0 - not paid, 1 - paid directly, 2 - paid to deliverer
      default: 0,
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
