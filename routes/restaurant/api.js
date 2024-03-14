const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const express = require("express");

const router = express.Router();

// Routes
// Auth routes
router.post("/login", authEndpoints.login);
router.post("/signup", authEndpoints.signUp);

// Data routes
router.get("/info", dataEndpoints.info);
router.put("/info", dataEndpoints.editInfo);
router.get("/menu", dataEndpoints.menu);
router.get("/orders", dataEndpoints.orders);
router.post("/addFoodItem", dataEndpoints.addFoodItem);

module.exports = router;
