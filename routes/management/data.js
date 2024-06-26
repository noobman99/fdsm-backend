const express = require("express");
const Restaurant = require("../../models/Restaurant");
const Customer = require("../../models/Customer");
const Deliverer = require("../../models/Deliverer");
const Order = require("../../models/Order");
const {
  formatManagement,
  formatCustomer,
  formatOrder,
  formatDeliverer,
  formatRestaurant,
  formatBalance,
} = require("../../helpers/DataFormatters");
const Offer = require("../../models/Offer");
const Balance = require("../../models/Balance");

const router = express.Router();

// Routes

exports.info = async (req, res, next) => {
  // Management info route
  let management = req.user;

  let resJson = formatManagement(management);

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit management info route
  let management = req.user;

  management.name = req.body.name;
  management.email = req.body.email;
  management.phone = req.body.phone;

  await management.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.customers = async (req, res, next) => {
  // All customers route
  let customers = await Customer.find({});

  let resJson = [];

  for (let customer of customers) {
    resJson.push(
      await formatCustomer(customer, {
        showAddress: true,
        showPhone: true,
        showEmail: true,
      })
    );
  }

  res.json(resJson);
};

exports.customerById = async (req, res, next) => {
  // Customer info route
  let customer = await Customer.findOne({ uid: req.params.id });
  if (!customer) {
    return res.status(406).json({ error: "Customer not found" });
  }

  let resJson = await formatCustomer(customer, {
    showAddress: true,
    showPhone: true,
    showEmail: true,
    showFavouriteRestaurants: true,
  });

  res.json(resJson);
};

exports.ordersByCustomer = async (req, res, next) => {
  // Customer orders route
  let customer = await Customer.find({ uid: req.params.id });

  if (!customer) {
    return res.status(406).json({ error: "Customer not found" });
  }

  let orders = await Order.find({ by: customer });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.deliverers = async (req, res, next) => {
  // All delivery agents route
  let deliveryAgents = await Deliverer.find({});

  let resJson = [];
  let temp;

  for (let deliveryAgent of deliveryAgents) {
    resJson.push(
      await formatDeliverer(deliveryAgent, {
        showWorkingStatus: true,
        showPhone: true,
        showEmail: true,
      })
    );
  }

  res.json(resJson);
};

exports.delivererById = async (req, res, next) => {
  // Delivery agent info route
  let deliveryAgent = await Deliverer.findOne({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(406).json({ error: "Delivery agent not found" });
  }

  let resJson = await formatDeliverer(deliveryAgent, {
    showWorkingStatus: true,
    showPhone: true,
    showEmail: true,
    showLocation: true,
    showReviews: true,
    showRating: true,
    showPendingMoney: true,
  });
  console.log(resJson);
  res.json(resJson);
};

exports.ordersByDeliverer = async (req, res, next) => {
  // Delivery agent orders route
  let deliveryAgent = await Deliverer.find({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(406).json({ error: "Delivery agent not found" });
  }

  let orders = await Order.find({ deliveryBy: deliveryAgent });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.markPaid = async (req, res, next) => {
  // Mark delivery agent paid route
  let deliveryAgent = await Deliverer.findOne({ uid: req.params.id });

  if (!deliveryAgent) {
    return res.status(406).json({ error: "Delivery agent not found" });
  }

  let orders = await Order.find({
    deliveryBy: deliveryAgent,
    isPaid: { $in: [2, 4] },
  });

  let total = 0;
  for (let order of orders) {
    order.isPaid = order.isPaid - 1;
    total += order.total;
    await order.save({ isNew: false });
  }

  let balSheet = await Balance.findOne({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  if (!balSheet) {
    let month = new Date().getMonth();
    month = month ? month - 1 : 11;
    let year = new Date().getFullYear();
    year = month !== 11 ? year : year - 1;
    balSheet = await Balance.findOne({ month, year });
  }

  if (!balSheet) {
    balSheet = await Balance.create({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
  }

  balSheet.toCollect -= total;
  balSheet.collected += total;
  balSheet.inHand += total;

  await balSheet.save({ isNew: false });

  res.json({ success: true });
};

exports.restaurants = async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(
      await formatRestaurant(restaurant, {
        showBriefMenu: true,
        showRating: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        showTags: true,
        showTimings: true,
        showImage: true,
      })
    );
  }

  res.json(resJson);
};

exports.restaurantById = async (req, res, next) => {
  // Restaurant info route
  let restaurant = await Restaurant.findOne({ uid: req.params.id });

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  let resJson = await formatRestaurant(restaurant, {
    showMenu: true,
    showRating: true,
    showTags: true,
    showTimings: true,
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showReviews: true,
    showImage: true,
    showAllDishes: true,
    showPendingMoney: true,
  });

  res.json(resJson);
};

exports.ordersByRestaurant = async (req, res, next) => {
  // Restaurant orders route
  let restaurant = await Restaurant.find({ uid: req.params.id });

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  let orders = await Order.find({ from: restaurant });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order));
  }

  res.json(resJson);
};

exports.markPaidRes = async (req, res, next) => {
  // Mark restaurant paid route
  let restaurant = await Restaurant.findOne({ uid: req.params.id });

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  let orders = await Order.find({ from: restaurant, isPaid: { $in: [1, 2] } });

  let total = 0;
  for (let order of orders) {
    order.isPaid = order.isPaid + 2;
    total += order.total;
    await order.save({ isNew: false });
  }

  let balSheet = await Balance.findOne({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  if (!balSheet) {
    let month = new Date().getMonth();
    month = month ? month - 1 : 11;
    let year = new Date().getFullYear();
    year = month !== 11 ? year : year - 1;
    balSheet = await Balance.findOne({ month, year });
  }

  if (!balSheet) {
    balSheet = await Balance.create({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
  }

  total = total * 0.9;
  balSheet.toGive -= total;
  balSheet.given += total;
  balSheet.inHand -= total;

  await balSheet.save({ isNew: false });

  res.json({ success: true });
};

exports.offers = async (req, res, next) => {
  // All offers route
  let offers = await Offer.find({});

  let resJson = [];

  for (let offer of offers) {
    resJson.push({
      code: offer.code,
      discount: offer.discount,
      customers: offer.customers.length,
    });
  }

  res.json(resJson);
};

exports.createOffer = async (req, res, next) => {
  // Create offer route
  let offer = new Offer({
    code: req.body.code,
    discount: req.body.discount,
  });

  try {
    await offer.save({
      validateBeforeSave: true,
      isNew: true,
    });
  } catch (err) {
    if (err.name === "MongoServerError") {
      return res.status(400).json({ error: "Not unique offer code!" });
    } else {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Cannot process your request at the time" });
    }
  }

  res.json({ success: true });
};

exports.deleteOffer = async (req, res, next) => {
  // Delete offer route
  let offer = await Offer.findOne({ code: req.params.code });

  if (!offer) {
    return res.status(406).json({ error: "Offer not found" });
  }

  try {
    await offer.deleteOne();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Cannot process your request at the time" });
  }

  res.json({ success: true });
};

exports.balances = async (req, res, next) => {
  // All balances route
  let balances = await Balance.find({});

  let resJson = [];

  for (let balance of balances) {
    resJson.push(formatBalance(balance));
  }

  res.json(resJson);
};

exports.stats = async (req, res, next) => {
  // Statistics route
  const statType = req.query.type;

  let orderFilter;

  if (statType === "today") {
    orderFilter = {
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59)),
      },
    };
  } else if (statType === "week") {
    orderFilter = {
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    };
  } else if (statType === "month") {
    orderFilter = {
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    };
  } else if (statType === "year") {
    orderFilter = {
      createdAt: {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      },
    };
  } else {
    orderFilter = {};
  }

  let orders = await Order.aggregate([
    {
      $match: orderFilter,
    },
    {
      $group: {
        _id: "$from",
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // console.log(orders);

  let numOrders = 0,
    totalRevenue = 0;
  for (let order of orders) {
    numOrders += order.count;
    totalRevenue += order.total * 0.1;
  }

  let numCustomers = await Customer.countDocuments({});
  let numNewCusts = (await Customer.aggregate([{ $match: orderFilter }]))
    .length;
  let numDeliverers = await Deliverer.countDocuments({});
  let numNewDel = (await Deliverer.aggregate([{ $match: orderFilter }])).length;
  let numRestaurants = await Restaurant.countDocuments({});
  let numNewRes = (await Restaurant.aggregate([{ $match: orderFilter }]))
    .length;
  let topRes = [];

  if (numOrders) {
    const idList = orders.slice(0, 5).map((order) => order._id);
    topRes = await Restaurant.find({ _id: { $in: idList } });
    console.log(topRes);
    console.log(idList);
  }

  res.json({
    numOrders,
    totalRevenue,
    totalCust: numCustomers,
    newCust: numNewCusts,
    totalDel: numDeliverers,
    newDel: numNewDel,
    totalRest: numRestaurants,
    newRest: numNewRes,
    topRes: topRes.length ? topRes.map((res) => res.name) : [],
  });
};
