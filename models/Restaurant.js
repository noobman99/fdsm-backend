const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  timings: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  reviews: {
    poster: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Customer",
    },
    review: {
      type: String,
    },
    rating: {
      type: Number,
    },
  },
  menu: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Dish",
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
