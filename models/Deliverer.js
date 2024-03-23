const mongoose = require("mongoose");

const delivererSchema = new mongoose.Schema(
  {
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
      type: {
        lat: {
          type: mongoose.Types.Decimal128,
          required: true,
          get: (v) => {
            return parseFloat(v);
          },
        },
        lon: {
          type: mongoose.Types.Decimal128,
          required: true,
          get: (v) => {
            return parseFloat(v);
          },
        },
      },
      default: {
        lat: 22.32601,
        lon: 87.31355,
      },
    },
    reviews: {
      type: [
        {
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
      ],
      default: [],
    },
  },
  { toJSON: { getters: true } }
);

const Deliverer = mongoose.model("Deliverer", delivererSchema);

module.exports = Deliverer;
