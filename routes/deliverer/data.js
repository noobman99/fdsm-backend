const express = require("express");
const Order = require("../../models/Order");
const { formatDeliverer } = require("../../helpers/DataFormatters");

const router = express.Router();

// Routes

exports.info = async (req, res, next) => {
  // Deliverer info route
  let deliverer = req.user;

  let resJson = formatDeliverer(deliverer);

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit deliverer info route
  let deliverer = req.user;

  deliverer.name = req.body.name;
  deliverer.email = req.body.email;
  deliverer.phone = req.body.phone;
  deliverer.address = req.body.address;

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
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
