const Deliverer = require("../models/Deliverer");

async function findDeliveryAgent(location) {
  let deliverer = await Deliverer.find({ isWorking: true });

  let minDistance = 999999999;
  let nearestDeliverer = deliverer[0];
  // code to find the nearest delivery agent

  return nearestDeliverer;
}

module.exports = findDeliveryAgent;
