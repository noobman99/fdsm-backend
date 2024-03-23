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
      type: [
        {
          dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dish",
          },
          quantity: {
            type: Number,
            min: 1,
          },
        },
      ],
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    etd: {
      type: Date,
      required: true,
    },
    isPaid: {
      type: Number, // 0 - not paid, 1 - paid directly, 2 - paid to deliverer
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isRestaurantRated: {
      type: Boolean,
      default: false,
    },
    isDelivererRated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
