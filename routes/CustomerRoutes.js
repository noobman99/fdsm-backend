const express = require("express");
const Restaurant = require("../models/Restaurant");
const findDeliveryAgent = require("../helpers/findDeliveryAgent");
const {
  formatOrder,
  formatRestaurant,
  formatCustomer,
} = require("../helpers/DataFormatters");
const Order = require("../models/Order");
const router = express.Router();

// Routes

router.get("/info", async (req, res, next) => {
  // Customer info route
  let customer = req.user;

  let resJson = formatCustomer(customer);

  res.json(resJson);
});

router.get("/orders", async (req, res, next) => {
  // Customer orders route
  let customer = req.user;
  let orders = await Order.find({ _id: { $in: customer.orders } });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
});

router.get("/favouriteRestaurants", async (req, res, next) => {
  // Favourite restaurants route
  let customer = req.user;
  let restaurants = await Restaurant.find({
    _id: { $in: customer.favouriteRestaurants },
  });

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(formatRestaurant(restaurant));
  }

  res.json(resJson);
});

router.get("/restaurants", async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(formatRestaurant(restaurant));
  }

  res.json(resJson);
});

router.get("/restaurant/:id", async (req, res, next) => {
  // Restaurant info route
  let restaurant = await Restaurant.find({ uid: req.params.id });

  let resJson = formatRestaurant(restaurant, true);

  res.json(resJson);
});

router.post("/newOrder", async (req, res, next) => {
  // New order route
  let customer = req.user;
  const restaurant = await Restaurant.findOne({ uid: req.body.restaurant });
  const deliveryAgent = await findDeliveryAgent(restaurant.address);

  let order = {
    by: customer._id,
    from: restaurant._id,
    deliveryBy: deliveryAgent._id,
    items: req.body.items,
    isPaid: req.body.isPaid,
    isCompleted: false,
  };

  order = Order.create(order);

  customer.orders.push(order._id);
  await customer.save();

  res.json({ message: "Order placed successfully" });
});

module.exports = router;
