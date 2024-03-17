const Restaurant = require("../../models/Restaurant");
const findDeliveryAgent = require("../../helpers/findDeliveryAgent");
const {
  formatOrder,
  formatRestaurant,
  formatCustomer,
} = require("../../helpers/DataFormatters");
const Order = require("../../models/Order");
const mongoose = require("mongoose");
const Dish = require("../../models/Dish");
const Deliverer = require("../../models/Deliverer");

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

  if (req.body.name) {
    customer.name = req.body.name;
  }
  if (req.body.email) {
    customer.email = req.body.email;
  }
  if (req.body.phone) {
    customer.phone = req.body.phone;
  }
  if (req.body.address) {
    customer.address = req.body.address;
  }

  try {
    await customer.save({
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
  // Customer orders route
  let customer = req.user;
  let orders = await Order.find({ by: customer._id });

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

  if (order.by.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(await formatOrder(order, true));
};

exports.favouriteRestaurants = async (req, res, next) => {
  // Favourite restaurants route
  let customer = req.user;
  let restaurants = await Restaurant.find({
    _id: { $in: customer.favouriteRestaurants },
  });

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(await formatRestaurant(restaurant));
  }

  res.json(resJson);
};

exports.newFavouriteRestaurant = async (req, res, next) => {
  // Add favourite restaurant route
  let customer = req.user;
  let restaurant = await Restaurant.findOne({ uid: req.params.id }, "_id");

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  if (customer.favouriteRestaurants.includes(restaurant._id)) {
    return res.status(400).json({ error: "Restaurant already in favourites" });
  }

  customer.favouriteRestaurants.push(restaurant._id);

  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.restaurants = async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(await formatRestaurant(restaurant));
  }

  res.json(resJson);
};

exports.restaurantById = async (req, res, next) => {
  // Restaurant info route
  let restaurant = await Restaurant.findOne({ uid: req.params.id });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  let resJson = await formatRestaurant(restaurant, true);

  res.json(resJson);
};

exports.newOrder = async (req, res, next) => {
  // New order route
  let customer = req.user;

  if (!req.body.restaurant) {
    return res.status(400).json({ error: "Invalid restaurant" });
  }
  if (!req.body.items) {
    return res.status(400).json({ error: "Invalid items" });
  }
  if (!req.body.deliveryAddress) {
    return res.status(400).json({ error: "Invalid delivery address" });
  }

  const restaurant = await Restaurant.findOne({ uid: req.body.restaurant });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const deliveryAgent = await findDeliveryAgent(restaurant.address);

  if (!deliveryAgent) {
    return res.status(404).json({
      error:
        "We are unable to place an order at the moment. Please try again later",
    });
  }

  let otp = String(Math.floor(1000 + Math.random() * 8999));

  let items = [];

  for (let item of req.body.items) {
    let dish = await Dish.findById(item.dish);

    if (!dish) {
      return res.status(404).json({ error: "Dish not found" });
    }

    if (dish.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(400).json({ error: "Invalid dish" });
    }

    items.push({
      dish: dish._id,
      quantity: item.quantity,
    });
  }

  let order = {
    by: customer._id,
    from: restaurant._id,
    deliveryBy: deliveryAgent._id,
    deliveryAddress: req.body.deliveryAddress,
    otp,
    items,
    isPaid: req.body.isPaid,
    isCompleted: false,
  };

  order = await Order.create(order);

  customer.orders.push(order._id);
  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json(await formatOrder(order));
};

exports.reviewRestaurant = async (req, res, next) => {
  // Post review route
  let customer = req.user;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid restaurant id" });
  }

  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  restaurant.rating =
    (restaurant.rating * restaurant.reviews.length + req.body.rating) /
    (restaurant.reviews.length + 1);

  restaurant.reviews.push({
    poster: customer._id,
    rating: req.body.rating,
    review: req.body.review,
  });

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.reviewDeliverer = async (req, res, next) => {
  // Post review route
  let customer = req.user;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid deliverer id" });
  }

  let deliverer = await Deliverer.findById(req.params.id);

  if (!deliverer) {
    return res.status(404).json({ error: "Deliverer not found" });
  }

  deliverer.rating =
    (deliverer.rating * deliverer.reviews.length + req.body.rating) /
    (deliverer.reviews.length + 1);

  deliverer.reviews.push({
    poster: customer._id,
    rating: req.body.rating,
    review: req.body.review,
  });

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};
