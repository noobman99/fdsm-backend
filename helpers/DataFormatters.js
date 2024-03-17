const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Dish = require("../models/Dish");

exports.formatDish = (
  dish,
  options = { showAvalability: false, showRestaurant: false }
) => {
  let res = {
    name: dish.name,
    price: dish.price,
    image: dish.image,
    id: dish.id,
  };

  if (options.showAvalability) {
    res.isAvailable = dish.isAvailable;
  }

  if (options.showRestaurant) {
    res.restaurant = dish.restaurant;
  }

  return res;
};

exports.formatOrder = (order, showOtp = false) => {
  let customer = Customer.findById(order.by);
  let restaurant = Restaurant.findById(order.from);
  let deliverer = Deliverer.findById(order.deliveryBy);

  items = order.items.map(async (item) => {
    let dish = await Dish.findById(item.dish);
    dish = this.formatDish(dish);

    return {
      dish,
      quantity: item.quantity,
    };
  });

  let res = {
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

  if (showOtp && !order.isCompleted) {
    res.otp = order.otp;
  }

  return res;
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
    tags: restaurant.tags,
  };

  if (containMenu) {
    res.menu = restaurant.menu.map(async (item) => {
      let dish = await Dish.findById(item);
      dish = this.formatDish(dish, {
        showAvalability: true,
        showRestaurant: true,
      });

      return dish;
    });
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

  if (containFavouriteRestaurants) {
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
