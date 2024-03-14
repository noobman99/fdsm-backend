const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const express = require("express");

const router = express.Router();

// Routes
// Auth routes
router.use("/login", authEndpoints.logIn);
router.use("/signup", authEndpoints.signUp);

// Data routes
router.use("/info", dataEndpoints.info);
router.use("/orders", dataEndpoints.orders);
router.use("/favouriteRestaurants", dataEndpoints.favouriteRestaurants);
router.use("/restaurants", dataEndpoints.restaurants);
router.use("/restaurant/:id", dataEndpoints.restaurantById);
router.use("/newOrder", dataEndpoints.newOrder);
