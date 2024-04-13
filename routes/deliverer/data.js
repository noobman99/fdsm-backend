const express = require("express");
const Order = require("../../models/Order");
const Customer = require("../../models/Customer");
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

  let resJson = await formatDeliverer(deliverer, {
    showWorkingStatus: true,
    showLocation: true,
    showEmail: true,
    showPhone: true,
  });

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
    return res.status(406).json({ error: "Order not found" });
  }

  if (order.deliveryBy.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(await formatOrder(order));
};

exports.currentOrder = async (req, res, next) => {
  // Deliverer current order route
  let deliverer = req.user;

  let order = await Order.findOne({
    deliveryBy: deliverer._id,
    status: { $in: [1, 2, 3] },
  });

  if (!order) {
    return res.status(406).json({ error: "No current order" });
  }

  let resJson = await formatOrder(order);

  let rest = await Restaurant.findById(order.from);

  resJson.pickupAddress = rest.address;

  res.json(resJson);
};

exports.updateOrder = async (req, res, next) => {
  const action = req.query.action;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  if (action === "collect") {
    return await collectOrder(req, res, next);
  } else if (action === "deliver") {
    return await deliverOrder(req, res, next);
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }
};

const collectOrder = async (req, res, next) => {
  // Collect order route
  let deliverer = req.user;

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(406).json({ error: "Order not found" });
  }

  if (order.deliveryBy._id.toString() !== deliverer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (order.status !== 2) {
    return res.status(406).json({ error: "Order not ready for collection" });
  }

  order.status = 1;

  await order.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

const deliverOrder = async (req, res, next) => {
  // Deliverer finish order route
  let deliverer = req.user;

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(406).json({ error: "Order not found" });
  }

  if (order.deliveryBy._id.toString() !== deliverer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (order.status === 0) {
    return res.status(406).json({ error: "Order already completed" });
  }

  if (order.status !== 1) {
    return res.status(406).json({ error: "Order has not been collected" });
  }

  if (order.otp !== req.body.otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  order.status = 0;
  order.isPaid = order.isPaid ? 1 : 2;

  deliverer.workingStatus = 1;

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

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

  if (deliverer.workingStatus === 0) {
    deliverer.workingStatus = 1;
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

  deliverer.workingStatus = 0;

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
