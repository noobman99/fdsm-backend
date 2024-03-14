const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const customerAuth = require("../../middleware/customerAuth");
const express = require("express");

const router = express.Router();

// Middleware
router.use(customerAuth);

// Routes
// Auth routes
router.post("/login", authEndpoints.logIn);
router.post("/signup", authEndpoints.signUp);

// Data routes
router.get("/info", dataEndpoints.info);
router.put("/info", dataEndpoints.editInfo);
router.get("/orders", dataEndpoints.orders);
router.get("/order/:id", dataEndpoints.orderById);
router.get("/favouriteRestaurants", dataEndpoints.favouriteRestaurants);
router.get("/restaurants", dataEndpoints.restaurants);
router.get("/restaurant/:id", dataEndpoints.restaurantById);
router.post("/newOrder", dataEndpoints.newOrder);

module.exports = router;
