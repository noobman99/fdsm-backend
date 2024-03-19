const mongoose = require("mongoose");

const delivererSchema = new mongoose.Schema({
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
  workingStatus: {
    // 0 - not working, 1 - available, 2 - in a delivery
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    default: "",
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
});

const Deliverer = mongoose.model("Deliverer", delivererSchema);

module.exports = Deliverer;
