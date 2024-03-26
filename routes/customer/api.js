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
router.post("/order", dataEndpoints.newOrder);
router.get("/order/:id", dataEndpoints.orderById);
router.get("/favouriterestaurants", dataEndpoints.favouriteRestaurants);
router.post("/favouriterestaurant/:id", dataEndpoints.newFavouriteRestaurant);
router.delete(
  "/favouriterestaurant/:id",
  dataEndpoints.removeFavouriteRestaurant
);
router.get("/restaurants", dataEndpoints.restaurants);
router.get("/restaurant/:id", dataEndpoints.restaurantById);
router.post("/reviews/restaurant/:id", dataEndpoints.reviewRestaurant);
router.post("/reviews/deliverer/:id", dataEndpoints.reviewDeliverer);
router.get("/offers", dataEndpoints.offers);
router.get("/recommendations", dataEndpoints.recommendations);

module.exports = router;
