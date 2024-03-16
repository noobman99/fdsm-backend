const express = require("express");
const Order = require("../../models/Order");
const {
  formatRestaurant,
  formatDish,
} = require("../../helpers/DataFormatters");
const Dish = require("../../models/Dish");
const router = express.Router();

// Routes

exports.info = async (req, res, next) => {
  // Customer info route
  let restaurant = req.user;

  let resJson = formatRestaurant(restaurant, true);

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit restaurant info route
  let restaurant = req.user;

  restaurant.name = req.body.name;
  restaurant.email = req.body.email;
  restaurant.phone = req.body.phone;
  restaurant.address = req.body.address;
  restaurant.timings = req.body.timings;
  restaurant.tags = req.body.tags;

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.menu = async (req, res, next) => {
  // Restaurant menu route
  let restaurant = req.user;

  let menu = restaurant.menu.map(async (item) => {
    let dish = await Dish.findById(item);

    return formatDish(dish, {
      showAvalability: true,
      showRestaurant: true,
    });
  });

  res.json(menu);
};

exports.orders = async (req, res, next) => {
  // Customer orders route
  let restaurant = req.user;
  let orders = await Order.find({ _id: { $in: restaurant.orders } });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
};

exports.addFoodItem = async (req, res, next) => {
  // Add food item route
  let restaurant = req.user;

  let dish = await Dish.find({
    restaurant: restaurant._id,
    name: req.body.name,
  });

  if (dish) {
    res.status(400).json({ error: "Food item already exists." });
  }

  dish = {
    name: req.body.name,
    image: req.body.image,
    restaurant: restaurant._id,
    price: req.body.price,
  };

  dish = await Dish.create(dish);

  restaurant.menu.push(dish._id);

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ message: "Food item added successfully" });
};

exports.reviews = async (req, res, next) => {
  // Restaurant reviews route
  let restaurant = req.user;

  let resJson = [];

  let poster;

  for (let review of restaurant.reviews) {
    poster = await Customer.findById(review.poster, "name");

    resJson.push({
      poster: poster.name,
      rating: review.rating,
      review: review.review,
    });
  }

  res.json(resJson);
};
