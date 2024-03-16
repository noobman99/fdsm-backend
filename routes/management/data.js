const express = require("express");
const Restaurant = require("../../models/Restaurant");
const Customer = require("../../models/Customer");
const Deliverer = require("../../models/Deliverer");
const Order = require("../../models/Order");
const {
  formatManagement,
  formatCustomer,
  formatOrder,
  formatDeliverer,
  formatRestaurant,
} = require("../../helpers/DataFormatters");

const router = express.Router();

// Routes

exports.info = async (req, res, next) => {
  // Management info route
  let management = req.user;

  let resJson = formatManagement(management);

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit management info route
  let management = req.user;

  management.name = req.body.name;
  management.email = req.body.email;
  management.phone = req.body.phone;

  await management.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.customers = async (req, res, next) => {
  // All customers route
  let customers = await Customer.find({});

  let resJson = [];

  for (let customer of customers) {
    resJson.push(formatCustomer(customer));
  }

  res.json(resJson);
};

exports.customerById = async (req, res, next) => {
  // Customer info route
  let customer = await Customer.find({ uid: req.params.id });

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  let resJson = formatCustomer(customer);

  resJson.favouriteRestaurants = await Restaurant.find({
    _id: { $in: customer.favouriteRestaurants },
  });

  res.json(resJson);
};

exports.ordersByCustomer = async (req, res, next) => {
  // Customer orders route
  let customer = await Customer.find({ uid: req.params.id });

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  let orders = await Order.find({ by: customer });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
};

exports.deliverers = async (req, res, next) => {
  // All delivery agents route
  let deliveryAgents = await Deliverer.find({});

  let resJson = [];
  let temp;

  for (let deliveryAgent of deliveryAgents) {
    resJson.push(formatDeliverer(deliveryAgent));
  }

  res.json(resJson);
};

exports.delivererById = async (req, res, next) => {
  // Delivery agent info route
  let deliveryAgent = await Deliverer.find({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(404).json({ error: "Delivery agent not found" });
  }

  let resJson = formatDeliverer(deliveryAgent);

  res.json(resJson);
};

exports.ordersByDeliverer = async (req, res, next) => {
  // Delivery agent orders route
  let deliveryAgent = await Deliverer.find({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(404).json({ error: "Delivery agent not found" });
  }

  let orders = await Order.find({ deliveryBy: deliveryAgent });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
};

exports.restaurants = async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(formatRestaurant(restaurant));
  }

  res.json(resJson);
};

exports.restaurantById = async (req, res, next) => {
  // Restaurant info route
  let restaurant = await Restaurant.find({ uid: req.params.id });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  let resJson = formatRestaurant(restaurant, true);

  res.json(resJson);
};

exports.ordersByRestaurant = async (req, res, next) => {
  // Restaurant orders route
  let restaurant = await Restaurant.find({ uid: req.params.id });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  let orders = await Order.find({ from: restaurant });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
};
