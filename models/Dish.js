const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  restaurants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Restaurant",
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
