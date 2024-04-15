const Restaurant = require("../../models/Restaurant");
const {
  findDeliveryAgent,
  getDistTime,
  geoCode,
} = require("../../helpers/maps");
const {
  formatOrder,
  formatRestaurant,
  formatCustomer,
} = require("../../helpers/DataFormatters");
const Order = require("../../models/Order");
const mongoose = require("mongoose");
const Dish = require("../../models/Dish");
const Deliverer = require("../../models/Deliverer");
const Offer = require("../../models/Offer");
const Balance = require("../../models/Balance");

// Routes

exports.info = async (req, res, next) => {
  // Customer info route
  let customer = req.user;

  let resJson = await formatCustomer(customer, {
    showAddress: true,
    showPhone: true,
    showEmail: true,
  });

  res.json(resJson);
};

exports.editInfo = async (req, res, next) => {
  // Edit customer info route
  let customer = req.user;

  if (req.body.name) {
    customer.name = req.body.name;
  }
  if (req.body.email) {
    customer.email = req.body.email;
  }
  if (req.body.phone) {
    customer.phone = req.body.phone;
  }
  if (req.body.address) {
    if (typeof req.body.address === "string") {
      let adr = encodeURIComponent(req.body.address);
      try {
        adr = await geoCode(adr);
        customer.address = { ...adr, text: req.body.address };
      } catch (error) {
        return res.status(406).json({ error: "Invalid Address" });
      }
    } else {
      customer.address = req.body.address;
    }
  }

  try {
    await customer.save({
      validateBeforeSave: true,
      isNew: false,
    });

    res.json({ success: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid Values" });
    } else {
      return res
        .status(500)
        .json({ error: "Server Error. Please try again later." });
    }
  }
};

exports.orders = async (req, res, next) => {
  // Customer orders route
  let customer = req.user;
  let orders = await Order.find({ by: customer._id });

  let resJson = [];

  for (let order of orders) {
    resJson.push(await formatOrder(order, { showRatingStatus: true }));
  }

  res.json(resJson);
};

exports.orderById = async (req, res, next) => {
  // Order info route
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(406).json({ error: "Order not found" });
  }

  if (order.by.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized to view this order" });
  }

  res.json(await formatOrder(order, { showOtp: true, showRatingStatus: true }));
};

exports.favouriteRestaurants = async (req, res, next) => {
  // Favourite restaurants route
  let customer = req.user;
  let restaurants = await Restaurant.find({
    _id: { $in: customer.favouriteRestaurants },
  });

  let resJson = [];

  for (let restaurant of restaurants) {
    resJson.push(
      await formatRestaurant(restaurant, {
        showRating: true,
        showEmail: true,
        showPhone: true,
        showAddress: true,
        showTags: true,
        showTimings: true,
        showImage: true,
      })
    );
  }

  res.json(resJson);
};

exports.newFavouriteRestaurant = async (req, res, next) => {
  // Add favourite restaurant route
  let customer = req.user;
  let restaurant = await Restaurant.findOne({ uid: req.params.id }, "_id");

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  if (customer.favouriteRestaurants.includes(restaurant._id)) {
    return res.status(400).json({ error: "Restaurant already in favourites" });
  }

  customer.favouriteRestaurants.push(restaurant._id);

  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.removeFavouriteRestaurant = async (req, res, next) => {
  // Remove favourite restaurant route
  let customer = req.user;

  let restaurant = await Restaurant.findOne({ uid: req.params.id }, "_id");

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  if (!customer.favouriteRestaurants.includes(restaurant._id)) {
    return res.status(400).json({ error: "Restaurant not in favourites" });
  }

  customer.favouriteRestaurants = customer.favouriteRestaurants.filter(
    (id) => id.toString() !== restaurant._id.toString()
  );

  await customer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.restaurants = async (req, res, next) => {
  // All restaurants route
  let restaurants = await Restaurant.find({});

  let resJson = [];

  for (let restaurant of restaurants) {
    let resto = await formatRestaurant(restaurant, {
      showBriefMenu: true,
      showRating: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showTags: true,
      showTimings: true,
      showImage: true,
    });
    resto.isFavourite = req.user.favouriteRestaurants.includes(restaurant._id);

    resJson.push(resto);
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
  });

  resJson.isFavourite = req.user.favouriteRestaurants.includes(restaurant._id);

  res.json(resJson);
};

exports.newOrder = async (req, res, next) => {
  // New order route
  let customer = req.user;

  // console.log(req.body);

  // Validation
  if (!req.body.restaurant) {
    return res.status(400).json({ error: "Invalid restaurant" });
  }
  if (!req.body.items) {
    return res.status(400).json({ error: "Invalid items" });
  }
  if (!req.body.deliveryAddress) {
    return res.status(400).json({ error: "Invalid delivery address" });
  }

  const restaurant = await Restaurant.findOne({ uid: req.body.restaurant });

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  // Find delivery agent
  let deliveryAgent, timefororder;
  try {
    ({ deliverer: deliveryAgent, time: timefororder } = await findDeliveryAgent(
      restaurant.address
    ));
  } catch (error) {
    if (error.name === "NoDelivererError") {
      return res.status(406).json({
        error:
          "We are unable to place an order at the moment. Please try again later",
      });
    } else {
      return res.status(500).json({
        error:
          "Cannot deliver to your location from given restaurant right now.",
      });
    }
  }

  // Find delivery time

  let deliveryAddress = req.body.deliveryAddress;
  if (typeof deliveryAddress === "string") {
    deliveryAddress = encodeURIComponent(deliveryAddress);

    try {
      deliveryAddress = await geoCode(deliveryAddress);
    } catch (error) {
      return res.status(400).json({ error: "Invalid Delivery Address" });
    }
  }

  let timeToDel;
  try {
    ({ time: timeToDel } = await getDistTime(
      restaurant.address,
      deliveryAddress
    ));

    deliveryAddress.text = req.body.deliveryAddress;
  } catch (error) {
    return res.status(406).json({
      error: `Cannot Deliver from ${restaurant.name} to your address.`,
    });
  }

  const max = (a, b) => (a > b ? a : b);
  const etd = new Date(
    Date.now() + max(timefororder * 1000, 600000) + timeToDel * 1000 + 600000
  ); // Estimated time of delivery. 10 minutes buffer time. 10 minutes minimum preparation time
  // * 1000 to convert seconds to milliseconds

  const otp = String(Math.floor(1000 + Math.random() * 8999));

  let items = [];
  let total = 0;

  for (let item of req.body.items) {
    let dish = await Dish.findById(item.dish);

    if (!dish) {
      return res.status(406).json({ error: "Dish not found" });
    }

    if (dish.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(400).json({ error: "Invalid dish" });
    }

    total += dish.price * item.quantity;

    items.push({
      dish: dish._id,
      quantity: item.quantity,
    });
  }

  if (req.body.offerCode) {
    let offer = await Offer.findOne({ code: req.body.offerCode });

    if (!offer) {
      return res.status(406).json({ error: "Offer not found" });
    }

    if (offer.customers.includes(customer._id)) {
      return res.status(406).json({ error: "Offer already used" });
    }

    total = total - (total * offer.discount) / 100;

    offer.customers.push(customer._id);

    await offer.save({
      validateBeforeSave: true,
      isNew: false,
    });
  }

  let order = {
    by: customer._id,
    from: restaurant._id,
    deliveryBy: deliveryAgent._id,
    deliveryAddress,
    otp,
    items,
    total,
    etd,
    isPaid: req.body.isPaid,
    status: 3,
  };

  if (req.body.isPaid === 1) {
    order.transactionID = req.body.transactionID;
  }

  if (req.body.offerCode) {
    order.offerCode = req.body.offerCode;
  }

  order = await Order.create(order);

  deliveryAgent.workingStatus = 2;

  await deliveryAgent.save({
    validateBeforeSave: true,
    isNew: false,
  });

  let balSheet = await Balance.findOne({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  if (!balSheet) {
    balSheet = await Balance.create({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
  }

  if (req.body.isPaid === 1) {
    balSheet.collected += total;
  } else {
    balSheet.toCollect += total;
  }
  balSheet.toGive += total * 0.9;

  await balSheet.save({ isNew: false });

  res.json(await formatOrder(order, { showOtp: true }));
};

exports.reviewRestaurant = async (req, res, next) => {
  // Post review route
  let customer = req.user;
  console.log(req.params.id);

  let restaurant = await Restaurant.findOne({ uid: req.params.id });

  if (!mongoose.Types.ObjectId.isValid(req.body.order)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  if (!restaurant) {
    return res.status(406).json({ error: "Restaurant not found" });
  }

  let order = await Order.findById(req.body.order);

  if (!order) {
    return res.status(406).json({ error: "Order not found" });
  }

  if (order.from.toString() !== restaurant._id.toString()) {
    return res.status(400).json({ error: "Invalid restaurant" });
  }

  if (order.by.toString() !== customer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  restaurant.rating = Math.round(
    (restaurant.rating * restaurant.reviews.length + Number(req.body.rating)) /
      (restaurant.reviews.length + 1)
  );

  restaurant.reviews.push({
    poster: customer._id,
    rating: req.body.rating,
    review: req.body.review,
  });

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  order.isRestaurantRated = true;

  await order.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.reviewDeliverer = async (req, res, next) => {
  // Post review route
  let customer = req.user;

  let deliverer = await Deliverer.findOne({ uid: req.params.id });

  if (!mongoose.Types.ObjectId.isValid(req.body.order)) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  let order = await Order.findById(req.body.order);

  if (!order) {
    return res.status(406).json({ error: "Order not found" });
  }

  if (!deliverer) {
    return res.status(406).json({ error: "Deliverer not found" });
  }

  if (order.deliveryBy.toString() !== deliverer._id.toString()) {
    return res.status(400).json({ error: "Invalid deliverer" });
  }

  if (order.by.toString() !== customer._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  deliverer.rating = Math.round(
    (deliverer.rating * deliverer.reviews.length + Number(req.body.rating)) /
      (deliverer.reviews.length + 1)
  );

  deliverer.reviews.push({
    poster: customer._id,
    rating: req.body.rating,
    review: req.body.review,
  });

  await deliverer.save({
    validateBeforeSave: true,
    isNew: false,
  });

  order.isDelivererRated = true;

  await order.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.json({ success: true });
};

exports.offers = async (req, res, next) => {
  // All offers route
  let offers = await Offer.find({
    customers: {
      $nin: [req.user._id],
    },
  });

  let resJson = [];

  for (let offer of offers) {
    resJson.push({
      code: offer.code,
      discount: offer.discount,
    });
  }

  res.json(resJson);
};

exports.recommendations = async (req, res, next) => {
  // Recommendations route
  // let orders = await Order.find({ by: req.user._id }, "from");
  const numRes = await Restaurant.countDocuments();

  let orders = await Order.aggregate([
    { $match: { by: req.user._id } },
    {
      $sortByCount: "$from",
    },
  ]);

  let restaurants = await Restaurant.find({
    _id: { $in: orders.map((o) => o._id) },
  });

  const LIMIT = 5;

  let added = new Set();

  let resJson = [];

  for (let restaurant of restaurants) {
    let resto = await formatRestaurant(restaurant, {
      showBriefMenu: true,
      showRating: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showTags: true,
      showTimings: true,
      showImage: true,
    });
    resto.isFavourite = req.user.favouriteRestaurants.includes(restaurant._id);

    resJson.push(resto);
    added.add(restaurant._id.toString());
  }

  // add restaurants with similar tags if less than LIMIT
  let i = 0;
  while (resJson.length < LIMIT && i < restaurants.length) {
    let recs = await Restaurant.aggregate([
      {
        $match: {
          _id: {
            $ne: restaurants[i]._id,
          },
          tags: {
            $in: restaurants[i].tags,
          },
        },
      },
      { $sort: { rating: -1 } },
      { $limit: LIMIT - resJson.length },
    ]);

    i++;

    for (let restaurant of recs) {
      if (added.has(restaurant._id.toString())) {
        continue;
      }

      let resto = await formatRestaurant(restaurant, {
        showBriefMenu: true,
        showRating: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        showTags: true,
        showTimings: true,
        showImage: true,
      });
      resto.isFavourite = req.user.favouriteRestaurants.includes(
        restaurant._id
      );

      resJson.push(resto);
      added.add(restaurant._id.toString());
    }
  }

  // add top rated restaurants if less than LIMIT
  while (resJson.length < LIMIT && added.size < numRes) {
    let recs = await Restaurant.aggregate([{ $sort: { rating: -1 } }]);

    for (let restaurant of recs) {
      if (added.has(restaurant._id.toString())) {
        continue;
      }

      let resto = await formatRestaurant(restaurant, {
        showBriefMenu: true,
        showRating: true,
        showAddress: true,
        showPhone: true,
        showEmail: true,
        showTags: true,
        showTimings: true,
        showImage: true,
      });
      resto.isFavourite = req.user.favouriteRestaurants.includes(
        restaurant._id
      );

      resJson.push(resto);
      added.add(restaurant._id.toString());
    }
  }

  res.json(resJson.slice(0, LIMIT));
};

const dotenv = require("dotenv");
dotenv.config();
const Razorpay = require("razorpay");
const Transaction = require("../../models/Transaction");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.checkout = async (req, res, next) => {
  // Checkout route
  const { amount } = req.body;

  const options = {
    amount: Number(amount * 100),
    currency: "INR",
  };
  const payment = await razorpay.orders.create(options);

  const transaction = await Transaction.create({
    customerID: req.user._id,
    amount: amount,
    transactionID: payment.id,
  });

  res.status(200).json({ transaction, payment });
};

exports.confirmPayment = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const transaction = await Transaction.findOneAndUpdate(
    { transactionID: razorpay_order_id },
    {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    }
  );

  if (!transaction) {
    return res.status(400).json({ message: "Invalid transaction" });
  }

  res
    .status(200)
    .json({ success: true, message: "Payment successful", transaction });
};
