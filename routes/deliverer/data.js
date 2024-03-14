const express = require("express");
const Deliverer = require("../../models/Deliverer");
const { formatDeliverer } = require("../../helpers/DataFormatters");

const router = express.Router();

// Routes

exports.info = async (req, res, next) => {
  // Deliverer info route
  let deliverer = req.user;

  let resJson = formatDeliverer(deliverer);

  res.json(resJson);
};

exports.orders = async (req, res, next) => {
  // Deliverer orders route
  let deliverer = req.user;

  let orders = await Order.find({ _id: { $in: deliverer.orders } });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(orders);
};
