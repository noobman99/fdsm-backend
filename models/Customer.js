const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
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
        type: Number,
        default: 0,
        required: true,
      },
      lon: {
        type: Number,
        default: 0,
        required: true,
      },
      text: {
        type: String,
        default: "",
        required: true,
      },
    },
  },
  favouriteRestaurants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Restaurant",
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
