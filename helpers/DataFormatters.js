const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Dish = require("../models/Dish");

exports.formatDish = async (
  dish,
  options = { showAvalability: false, showRestaurant: false }
) => {
  let res = {
    name: dish.name,
    price: dish.price,
    image: dish.image,
    uid: dish.id,
  };

  if (options.showAvalability) {
    res.isAvailable = dish.isAvailable;
  }

  if (options.showRestaurant) {
    res.restaurant = (await Restaurant.findById(dish.restaurant, "name")).name;
  }

  return res;
};

exports.formatOrder = async (order, showOtp = false) => {
  let customer = await Customer.findById(order.by);
  let restaurant = await Restaurant.findById(order.from);
  let deliverer = await Deliverer.findById(order.deliveryBy);

  let items = [];

  for (let item of order.items) {
    let dish = await Dish.findById(item.dish);
    dish = await this.formatDish(dish);

    items.push({
      dish,
      quantity: item.quantity,
    });
  }

  let res = {
    customer: this.formatCustomer(customer),
    restaurant: await this.formatRestaurant(restaurant),
    deliverer: this.formatDeliverer(deliverer),
    deliveryAddress: order.deliveryAddress,
    items,
    total: order.total,
    isPaid: order.isPaid,
    uid: order.id,
    isCompleted: order.isCompleted,
    orderTime: order._id.getTimestamp(),
  };

  if (showOtp && !order.isCompleted) {
    res.otp = order.otp;
    res.etd = order.etd;
  }

  return res;
};

exports.formatRestaurant = async (restaurant, containMenu = false) => {
  let res = {
    name: restaurant.name,
    email: restaurant.email,
    uid: restaurant.uid,
    phone: restaurant.phone,
    address: restaurant.address.text,
    timings: restaurant.timings,
    rating: restaurant.rating,
    tags: restaurant.tags,
  };

  if (containMenu) {
    res.menu = [];

    for (let item of restaurant.menu) {
      let dish = await Dish.findById(item);
      dish = await this.formatDish(dish, { showAvalability: true });
      res.menu.push(dish);
    }
  }

  return res;
};

exports.formatCustomer = (customer, containFavouriteRestaurants = false) => {
  let res = {
    name: customer.name,
    email: customer.email,
    uid: customer.uid,
    phone: customer.phone,
    address: customer.address.text,
  };

  if (containFavouriteRestaurants) {
    res.favouriteRestaurants = customer.favouriteRestaurants;
  }

  return res;
};

exports.formatDeliverer = (deliverer, showWorkingStatus = false) => {
  let res = {
    name: deliverer.name,
    email: deliverer.email,
    uid: deliverer.uid,
    phone: deliverer.phone,
    address: deliverer.address.text,
  };

  if (showWorkingStatus) {
    res.workingStatus = deliverer.workingStatus;
  }

  return res;
};

exports.formatManagement = (management) => {
  return {
    name: management.name,
    email: management.email,
    uid: management.uid,
    phone: management.phone,
    address: management.address.text,
  };
};
