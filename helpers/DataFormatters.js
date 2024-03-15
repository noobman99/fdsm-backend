const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");

exports.formatOrder = (order) => {
  let customer = Customer.findById(order.by);
  let restaurant = Restaurant.findById(order.from);
  let deliverer = Deliverer.findById(order.deliveryBy);

  return {
    customer,
    restaurant,
    deliverer,
    deliveryAddress: order.deliveryAddress,
    items: order.items,
    isPaid: order.isPaid,
    uid: order.id,
    isCompleted: order.isCompleted,
    orderTime: order._id.getTimestamp(),
  };
};

exports.formatRestaurant = (restaurant, containMenu = false) => {
  let res = {
    name: restaurant.name,
    email: restaurant.email,
    uid: restaurant.uid,
    phone: restaurant.phone,
    address: restaurant.address,
    timings: restaurant.timings,
    rating: restaurant.rating,
  };

  if (containMenu) {
    res.menu = restaurant.menu;
  }

  return res;
};

exports.formatCustomer = (customer, containFavouriteRestaurants = false) => {
  let res = {
    name: customer.name,
    email: customer.email,
    uid: customer.uid,
    phone: customer.phone,
    address: customer.address,
  };

  if (containFavourites) {
    res.favouriteRestaurants = customer.favouriteRestaurants;
  }

  return res;
};

exports.formatDeliverer = (deliverer) => {
  return {
    name: deliverer.name,
    email: deliverer.email,
    uid: deliverer.uid,
    phone: deliverer.phone,
    address: deliverer.address,
    isWorking: deliverer.isWorking,
  };
};

exports.formatManagement = (management) => {
  return {
    name: management.name,
    email: management.email,
    uid: management.uid,
    phone: management.phone,
    address: management.address,
  };
};
