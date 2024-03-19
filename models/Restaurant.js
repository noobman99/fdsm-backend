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
    type: {
      lat: {
        type: mongoose.Types.Decimal128,
        default: 22.32601,
        required: true,
      },
      lon: {
        type: mongoose.Types.Decimal128,
        default: 87.31355,
        required: true,
      },
      text: {
        type: String,
        default: "",
        required: true,
      },
    },
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
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
