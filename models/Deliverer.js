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
  isWorking: {
    type: Boolean,
    default: false,
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
  },
});

const Deliverer = mongoose.model("Deliverer", delivererSchema);

module.exports = Deliverer;
