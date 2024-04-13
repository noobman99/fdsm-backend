const authEndpoints = require("./auth");
const dataEndpoints = require("./data");
const managementAuth = require("../../middleware/managementAuth");
const express = require("express");

const router = express.Router();

// Middleware
router.use(managementAuth);

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
router.post("/markpaid/deliverer/:id", dataEndpoints.markPaid);
router.get("/restaurants", dataEndpoints.restaurants);
router.get("/restaurant/:id", dataEndpoints.restaurantById);
router.post("/markpaid/restaurant/:id", dataEndpoints.markPaidRes);
router.get("/orders/restaurant/:id", dataEndpoints.ordersByRestaurant);
router.get("/balances", dataEndpoints.balances);
router.get("/stats", dataEndpoints.stats);

router.get("/offers", dataEndpoints.offers);
router.post("/offer", dataEndpoints.createOffer);
router.delete("/offer/:code", dataEndpoints.deleteOffer);

module.exports = router;
