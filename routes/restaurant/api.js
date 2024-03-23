const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const restaurantAuth = require("../../middleware/restaurantAuth");
const express = require("express");

const router = express.Router();

// Middleware
router.use(restaurantAuth);

// Routes
// Auth routes
router.post("/login", authEndpoints.logIn);
router.post("/signup", authEndpoints.signUp);

// Data routes
router.get("/info", dataEndpoints.info);
router.put("/info", dataEndpoints.editInfo);
router.post("/info/image", dataEndpoints.setImage);
router.get("/orders", dataEndpoints.orders);
router.get("/order/:id", dataEndpoints.orderById);
router.get("/menu", dataEndpoints.menu);
router.post("/menu", dataEndpoints.addFoodItem);
router.get("/menu/:id", dataEndpoints.foodItem);
router.delete("/menu/:id", dataEndpoints.removeFoodItem);
router.put("/menu/:id", dataEndpoints.updateFoodItem);

router.post("/reviews", dataEndpoints.reviews);

module.exports = router;
