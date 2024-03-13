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
    type: String,
    required: true,
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
  },
  favouriteRestaurants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Restaurant",
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
