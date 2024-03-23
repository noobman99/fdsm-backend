const express = require("express");
const Order = require("../../models/Order");
const {
  formatRestaurant,
  formatDish,
  formatOrder,
} = require("../../helpers/DataFormatters");
const Dish = require("../../models/Dish");
const { default: mongoose } = require("mongoose");
const { geoCode } = require("../../helpers/maps");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Routes

exports.info = async (req, res, next) => {
  // Customer info route
  let restaurant = req.user;

  let resJson = await formatRestaurant(restaurant, {
    showRating: true,
    showReviews: true,
    showAddress: true,
    showPhone: true,
    showEmail: true,
    showTimings: true,
    showTags: true,
    showImage: true,
  });

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit restaurant info route
  let restaurant = req.user;

  if (req.body.name) {
    restaurant.name = req.body.name;
  }
  if (req.body.email) {
    restaurant.email = req.body.email;
  }
  if (req.body.phone) {
    restaurant.phone = req.body.phone;
  }
  if (req.body.address) {
    if (typeof req.body.address === "string") {
      let adr = req.body.address;
      adr = encodeURIComponent(adr);
      try {
        adr = await geoCode(adr);
        restaurant.address = { ...adr, text: req.body.address };
      } catch (error) {
        return res.status(404).json({ error: "Invalid Address" });
      }
    } else {
      restaurant.address = req.body.address;
    }
  }
  if (req.body.timings) {
    restaurant.timings = req.body.timings;
  }
  if (req.body.tags) {
    restaurant.tags = req.body.tags;
  }

  try {
    await restaurant.save({
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

exports.setImage = async (req, res, next) => {
  // Set restaurant image route

  let restaurant = req.user;

  const directory = "assets/images/" + restaurant.uid;

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "assets/images/" + restaurant.uid);
    },
    filename: function (req, file, cb) {
      cb(null, "index" + path.extname(file.originalname));
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        console.log(file.mimetype);
        return cb(new Error("Invalid Image 2"));
      }
      cb(null, true);
    },
  });

  const upload = multer({ storage: storage }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      console.log("here");
      console.log(err);
      return res.status(400).json({ error: "Invalid Image" });
    }

    restaurant.image = req.file.path;

    try {
      await restaurant.save({
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
  });
};

exports.menu = async (req, res, next) => {
  // Restaurant menu route
  let restaurant = req.user;

  let menu = [];

  for (let item of restaurant.menu) {
    let dish = await Dish.findById(item);

    dish = await formatDish(dish, {
      showAvalability: true,
      showRestaurant: true,
      showImage: true,
      showPrice: true,
    });

    menu.push(dish);
  }

  res.json(menu);
};

exports.orders = async (req, res, next) => {
  // Customer orders route
  let restaurant = req.user;
  let orders = await Order.find({ from: restaurant._id });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.orderById = async (req, res, next) => {
  // Order info route
  let order;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  try {
    order = await Order.findById(req.params.id);
  } catch (error) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.from.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(await formatOrder(order));
};

exports.addFoodItem = async (req, res, next) => {
  // Add food item route
  let restaurant = req.user;

  if (!req.body.name /*|| !req.body.image*/ || !req.body.price) {
    return res.status(400).json({ error: "Invalid Values" });
  }

  let dish = await Dish.findOne({
    restaurant: restaurant._id,
    name: req.body.name,
  });

  if (dish) {
    return res.status(400).json({ error: "Food item already exists." });
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

exports.removeFoodItem = async (req, res, next) => {
  // Remove food item route
  let restaurant = req.user;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid dish id" });
  }

  let dish = await Dish.find({
    restaurant: restaurant._id,
    _id: req.params.id,
  });

  if (!dish) {
    return res.status(400).json({ error: "Food item not found." });
  }

  restaurant.menu = restaurant.menu.filter((item) => item !== dish._id);

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  await Dish.findByIdAndDelete(dish._id);

  res.json({ message: "Food item removed successfully" });
};

exports.updateFoodItem = async (req, res, next) => {
  // Update food item route
  let restaurant = req.user;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid dish id" });
  }

  let dish = await Dish.findOne({
    restaurant: restaurant._id,
    _id: req.params.id,
  });

  if (!dish) {
    return res.status(400).json({ error: "Food item not found." });
  }

  if (req.body.name) {
    dish.name = req.body.name;
  }
  if (req.body.image) {
    dish.image = req.body.image;
  }
  if (req.body.price) {
    dish.price = req.body.price;
  }
  if (req.body.isAvailable) {
    dish.isAvailable = req.body.isAvailable;
  }

  await dish.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ message: "Food item updated successfully" });
};

exports.foodItem = async (req, res, next) => {
  // Food item info route

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid dish id" });
  }

  let dish = await Dish.findById(req.params.id);

  if (!dish) {
    return res.status(404).json({ error: "Food item not found" });
  }

  if (dish.restaurant.toString() !== req.user._id.toString()) {
    return res.status(400).json({ error: "Invalid dish" });
  }

  res.json(
    await formatDish(dish, {
      showAvalability: true,
      showRestaurant: true,
      showImage: true,
      showPrice: true,
    })
  );
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
