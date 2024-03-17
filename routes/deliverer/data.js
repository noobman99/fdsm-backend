const express = require("express");
const Order = require("../../models/Order");
const {
  formatOrder,
  formatDeliverer,
} = require("../../helpers/DataFormatters");
const { default: mongoose } = require("mongoose");

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

  if (req.body.name) {
    deliverer.name = req.body.name;
  }
  if (req.body.email) {
    deliverer.email = req.body.email;
  }
  if (req.body.phone) {
    deliverer.phone = req.body.phone;
  }
  if (req.body.address) {
    deliverer.address = req.body.address;
  }

  try {
    await deliverer.save({
      validateBeforeSave: true,
      isNew: false,
    });

    res.json({ success: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid Values" });
    } else {
      return res.status(500).json({ error: "Server Error" });
    }
  }
};

exports.orders = async (req, res, next) => {
  // Deliverer orders route
  let deliverer = req.user;

  let orders = await Order.find({ deliveryBy: deliverer._id });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.orderById = async (req, res, next) => {
  // Order info route
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.deliverer.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(await formatOrder(order));
};

exports.currentOrder = async (req, res, next) => {
  // Deliverer current order route
  let deliverer = req.user;

  let order = await Order.findOne({
    deliverer: deliverer._id,
    isCompleted: false,
  });

  if (!order) {
    return res.status(404).json({ error: "No current order" });
  }

  let resJson = await formatOrder(order);

  let rest = await Restaurant.findById(order.from);

  resJson.pickupAddress = rest.address;

  res.json(resJson);
};

exports.finishOrder = async (req, res, next) => {
  // Deliverer finish order route
  let deliverer = req.user;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.deliverer.toString() !== deliverer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (order.isCompleted) {
    return res.status(400).json({ error: "Order already completed" });
  }

  if (order.otp !== req.body.otp) {
    return res.status(400).json({ error: "Invalid OTP" });
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

exports.reviews = async (req, res, next) => {
  // Deliverer reviews route
  let deliverer = req.user;

  let resJson = [];

  let poster;

  for (let review of deliverer.reviews) {
    poster = await Customer.findById(review.poster, "name");

    resJson.push({
      poster: poster.name,
      text: review.text,
      rating: review.rating,
    });
  }

  res.json(resJson);
};
