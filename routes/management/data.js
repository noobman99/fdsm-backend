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
    resJson.push(
      await formatCustomer(customer, {
        showAddress: true,
        showPhone: true,
        showEmail: true,
      })
    );
  }

  res.json(resJson);
};

exports.customerById = async (req, res, next) => {
  // Customer info route
  let customer = await Customer.findOne({ uid: req.params.id });
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  let resJson = await formatCustomer(customer, {
    showAddress: true,
    showPhone: true,
    showEmail: true,
    showFavouriteRestaurants: true,
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
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.deliverers = async (req, res, next) => {
  // All delivery agents route
  let deliveryAgents = await Deliverer.find({});

  let resJson = [];
  let temp;

  for (let deliveryAgent of deliveryAgents) {
    resJson.push(
      await formatDeliverer(deliveryAgent, {
        showWorkingStatus: true,
        showPhone: true,
        showEmail: true,
      })
    );
  }

  res.json(resJson);
};

exports.delivererById = async (req, res, next) => {
  // Delivery agent info route
  let deliveryAgent = await Deliverer.findOne({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(404).json({ error: "Delivery agent not found" });
  }

  let resJson = await formatDeliverer(deliveryAgent, {
    showWorkingStatus: true,
    showPhone: true,
    showEmail: true,
    showLocation: true,
    showReviews: true,
  });
  console.log(resJson);
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
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.restaurants = async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(
      await formatRestaurant(restaurant, {
        showBriefMenu: true,
        showRating: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        showTags: true,
        showTimings: true,
        showImage: true,
      })
    );
  }

  res.json(resJson);
};

exports.restaurantById = async (req, res, next) => {
  // Restaurant info route
  let restaurant = await Restaurant.findOne({ uid: req.params.id });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  let resJson = await formatRestaurant(restaurant, {
    showMenu: true,
    showRating: true,
    showTags: true,
    showTimings: true,
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showReviews: true,
    showImage: true,
    showAllDishes: true,
  });

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
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};
