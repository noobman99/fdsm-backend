const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
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
    image: {
      type: String,
      default: "",
    },
    address: {
      type: {
        lat: {
          type: mongoose.Types.Decimal128,
          default: 22.32601,
          required: true,
          get: (v) => {
            return parseFloat(v);
          },
        },
        lon: {
          type: mongoose.Types.Decimal128,
          default: 87.31355,
          required: true,
          get: (v) => {
            return parseFloat(v);
          },
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
      type: {
        open: {
          type: Number,
          default: 10,
        },
        close: {
          type: Number,
          default: 22,
        },
      },
      required: true,
    },
    rating: {
      type: Number,
      default: 2,
    },
    tags: {
      type: [String],
      default: [],
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
    dishCount: {
      type: Number,
      default: 0,
    },
  },
  { toJSON: { getters: true } }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
