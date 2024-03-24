const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  customers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
