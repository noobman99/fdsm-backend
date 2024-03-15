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

exports.orderById = async (req, res, next) => {
  // Order info route
  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.deliverer.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(formatOrder(order));
};

exports.finishOrder = async (req, res, next) => {
  // Deliverer finish order route
  let deliverer = req.user;

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.deliverer.toString() !== deliverer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  order.isCompleted = true;
  order.isPaid = order.isPaid ? 1 : 2;

  await order.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.updateLocation = async (req, res, next) => {
  // Update deliverer location route
  let deliverer = req.user;

  deliverer.location = req.body.location;

  if (!deliverer.isWorking) {
    deliverer.isWorking = true;
  }

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.pauseWorking = async (req, res, next) => {
  // Pause working route
  let deliverer = req.user;

  deliverer.isWorking = false;

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};