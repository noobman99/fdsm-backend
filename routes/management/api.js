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
router.use("/customers", dataEndpoints.customers);
router.use("/customer/:id", dataEndpoints.customerById);
router.use("/orders/customer/:id", dataEndpoints.ordersByCustomer);
router.use("/deliverers", dataEndpoints.deliverers);
router.use("/deliverer/:id", dataEndpoints.delivererById);
router.use("/orders/deliverer/:id", dataEndpoints.ordersByDeliverer);
router.use("/restaurants", dataEndpoints.restaurants);
router.use("/restaurant/:id", dataEndpoints.restaurantById);
router.use("/orders/restaurant/:id", dataEndpoints.ordersByRestaurant);

module.exports = router;
