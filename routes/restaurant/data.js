const express = require("express");
const Order = require("../../models/Order");
const { formatRestaurant } = require("../../helpers/DataFormatters");
const router = express.Router();

// Routes

router.get("/info", async (req, res, next) => {
  // Customer info route
  let restaurant = req.user;

  let resJson = formatRestaurant(restaurant, true);

  res.json(resJson);
});

router.get("/menu", async (req, res, next) => {
  // Restaurant menu route
  let restaurant = req.user;

  res.json(restaurant.menu);
});

router.get("/orders", async (req, res, next) => {
  // Customer orders route
  let restaurant = req.user;
  let orders = await Order.find({ _id: { $in: restaurant.orders } });

  let resJson = [];

  for (let order of orders) {
    resJson.push(formatOrder(order));
  }

  res.json(resJson);
});

router.post("/addFoodItem", async (req, res, next) => {
  // Add food item route
  let restaurant = req.user;

  let foodItem = {
    name: req.body.name,
    price: req.body.price,
    tags: req.body.tags,
  };

  restaurant.menu.push(foodItem);

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ message: "Food item added successfully" });
});

module.exports = router;
