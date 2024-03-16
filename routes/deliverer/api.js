const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const delivererAuth = require("../../middleware/delivererAuth");
const express = require("express");

const router = express.Router();

// Middleware
router.use(delivererAuth);

// Routes
// Auth routes
router.post("/login", authEndpoints.logIn);
router.post("/signup", authEndpoints.signUp);

// Data routes
router.get("/info", dataEndpoints.info);
router.put("/info", dataEndpoints.editInfo);
router.get("/orders", dataEndpoints.orders);
router.get("/order/:id", dataEndpoints.orderById);
router.get("/current", dataEndpoints.currentOrder);
router.put("/order/:id", dataEndpoints.completeOrder);
router.put("/location", dataEndpoints.updateLocation);
router.put("/working", dataEndpoints.pauseWorking);
router.get("/reviews", dataEndpoints.reviews);

module.exports = router;
