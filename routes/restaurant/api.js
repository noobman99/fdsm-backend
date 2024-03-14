const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const express = require("express");

const router = express.Router();

// Routes
// Auth routes
router.use("/login", authEndpoints.login);
router.use("/signup", authEndpoints.signUp);

// Data routes
router.use("/info", dataEndpoints.info);
router.use("/menu", dataEndpoints.menu);
router.use("/orders", dataEndpoints.orders);
router.use("/addFoodItem", dataEndpoints.addFoodItem);

module.exports = router;
