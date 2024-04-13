const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  toCollect: {
    type: Number,
    default: 0,
  },
  collected: {
    type: Number,
    default: 0,
  },
  inHand: {
    type: Number,
    default: 0,
  },
  toGive: {
    type: Number,
    default: 0,
  },
  given: {
    type: Number,
    default: 0,
  },
});

const Balance = mongoose.model("Balance", BalanceSchema);
