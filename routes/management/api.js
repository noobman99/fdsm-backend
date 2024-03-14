const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const express = require("express");

const router = express.Router();

// Routes
// Auth routes
router.post("/login", authEndpoints.logIn);
router.post("/signup", authEndpoints.signUp);

// Data routes
router.get("/info", dataEndpoints.info);
router.put("/info", dataEndpoints.editInfo);
router.get("/customers", dataEndpoints.customers);
router.get("/customer/:id", dataEndpoints.customerById);
router.get("/orders/customer/:id", dataEndpoints.ordersByCustomer);
router.get("/deliverers", dataEndpoints.deliverers);
router.get("/deliverer/:id", dataEndpoints.delivererById);
router.get("/orders/deliverer/:id", dataEndpoints.ordersByDeliverer);
router.get("/restaurants", dataEndpoints.restaurants);
router.get("/restaurant/:id", dataEndpoints.restaurantById);
router.get("/orders/restaurant/:id", dataEndpoints.ordersByRestaurant);

module.exports = router;
