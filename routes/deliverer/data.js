const express = require("express");
const Deliverer = require("../../models/Deliverer");
const { formatDeliverer } = require("../../helpers/DataFormatters");

const router = express.Router();

// Routes

router.get("/info", async (req, res, next) => {
  // Deliverer info route
  let deliverer = req.user;

  let resJson = formatDeliverer(deliverer);

  res.json(resJson);
});

module.exports = router;
