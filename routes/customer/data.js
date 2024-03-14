const Restaurant = require("../../models/Restaurant");
const findDeliveryAgent = require("../../helpers/findDeliveryAgent");
const {
  formatOrder,
  formatRestaurant,
  formatCustomer,
} = require("../../helpers/DataFormatters");
const Order = require("../../models/Order");
const mongoose = require("mongoose");

// Routes

exports.info = async (req, res, next) => {
  // Customer info route
  let customer = req.user;

  let resJson = formatCustomer(customer);

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit customer info route
  let customer = req.user;

  customer.name = req.body.name;
  customer.email = req.body.email;
  customer.phone = req.body.phone;
  customer.address = req.body.address;

  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.orders = async (req, res, next) => {
  // Customer orders route
  let customer = req.user;
  let orders = await Order.find({ _id: { $in: customer.orders } });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
};

exports.orderById = async (req, res, next) => {
  // Order info route
  let order = await Order.findById(mongoose.Types.ObjectId(req.params.id));

  res.json(formatOrder(order));
};

exports.favouriteRestaurants = async (req, res, next) => {
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

  let resJson = formatRestaurant(restaurant, true);

  res.json(resJson);
};

exports.newOrder = async (req, res, next) => {
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
  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({
    customer: customer.name,
    restaurent: restaurant.name,
    deliverer: deliveryAgent.name,
    uid: order.id,
    items: req.body.items,
    isPaid: req.body.isPaid,
    isCompleted: false,
    orderTime: order._id.getTimestamp(),
  });
};
