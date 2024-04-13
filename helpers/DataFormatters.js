const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Dish = require("../models/Dish");
const Order = require("../models/Order");

exports.formatDish = async (
  dish,
  options = {
    showAvalability: false,
    showRestaurant: false,
    showImage: false,
    showPrice: false,
  }
) => {
  let res = {
    name: dish.name,
    uid: dish._id.toString(),
  };

  if (options.showAvalability) {
    res.isAvailable = dish.isAvailable;
  }

  if (options.showRestaurant) {
    res.restaurant = (await Restaurant.findById(dish.restaurant, "name")).name;
  }

  if (options.showImage) {
    res.image = "/" + dish.image.replace(/\\/g, "/");
  }

  if (options.showPrice) {
    res.price = dish.price;
  }

  return res;
};

exports.formatOrder = async (
  order,
  options = { showOtp: false, showRatingStatus: false }
) => {
  let customer = await Customer.findById(order.by);
  let restaurant = await Restaurant.findById(order.from);
  let deliverer = await Deliverer.findById(order.deliveryBy);

  let items = [];

  for (let item of order.items) {
    let dish = await Dish.findById(item.dish);
    dish = await this.formatDish(dish, {
      showPrice: true,
    });

    items.push({
      dish,
      quantity: item.quantity,
    });
  }

  let res = {
    customer: await this.formatCustomer(customer, {
      showLocation: true,
    }),
    restaurant: await this.formatRestaurant(restaurant, {
      showPhone: true,
      showAddress: true,
      showImage: true,
    }),
    deliverer: await this.formatDeliverer(deliverer, {
      showPhone: true,
      showLocation: true,
    }),
    deliveryAddress: {
      lat: order.deliveryAddress.lat,
      lon: order.deliveryAddress.lon,
      text: order.deliveryAddress.text,
    },
    items,
    total: order.total,
    isPaid: order.isPaid !== 0,
    uid: order._id.toString(),
    status: order.status,
    orderTime: order._id.getTimestamp(),
  };

  if (options.showOtp && order.status !== 0) {
    res.otp = order.otp;
    res.etd = order.etd;
  }

  if (options.showRatingStatus) {
    res.isRestaurantRated = order.isRestaurantRated;
    res.isDelivererRated = order.isDelivererRated;
  }

  if (order.offer) {
    res.offerCode = order.offerCode;
  }

  return res;
};

exports.formatRestaurant = async (
  restaurant,
  options = {
    showMenu: false,
    showBriefMenu: false,
    showRating: false,
    showTags: false,
    showTimings: false,
    showPhone: false,
    showEmail: false,
    showAddress: false,
    showReviews: false,
    showImage: false,
    showAllDishes: false,
    showPendingMoney: false,
  }
) => {
  let res = {
    name: restaurant.name,
    uid: restaurant.uid,
  };

  if (options.showRating) {
    res.rating = restaurant.rating;
  }

  if (options.showTags) {
    res.tags = restaurant.tags;
  }

  if (options.showTimings) {
    res.timings = {
      open: restaurant.timings.open,
      close: restaurant.timings.close,
    };
  }

  if (options.showPhone) {
    res.phone = restaurant.phone;
  }

  if (options.showEmail) {
    res.email = restaurant.email;
  }

  if (options.showAddress) {
    res.address = restaurant.address.text;
  }

  if (options.showMenu || options.showBriefMenu) {
    res.menu = [];

    const restaurantMenu = await Dish.find({ restaurant: restaurant._id });

    for (let dish of restaurantMenu) {
      if (!dish.isAvailable && !options.showAllDishes) continue;

      if (options.showMenu) {
        dish = await this.formatDish(dish, {
          showAvalability: true,
          showPrice: true,
          showImage: true,
        });
      } else {
        dish = dish.name;
      }
      res.menu.push(dish);
    }
  }

  if (options.showReviews) {
    res.reviews = [];

    if (restaurant.reviews) {
      for (let review of restaurant.reviews) {
        let poster = await Customer.findById(review.poster);
        res.reviews.push({
          poster: { name: poster.name, uid: poster.uid },
          rating: review.rating,
          comment: review.review,
        });
      }
    }
  }

  if (options.showImage && restaurant.image) {
    res.image = "/" + restaurant.image.replace(/\\/g, "/");
  }

  if (options.showPendingMoney) {
    const orders = await Order.find({
      from: restaurant._id,
      isPaid: { $in: [1, 2] },
    });

    console.log(orders);

    res.pendingMoney = 0;

    for (let order of orders) {
      res.pendingMoney += order.total;
    }
  }

  return res;
};

exports.formatCustomer = async (
  customer,
  options = {
    showFavouriteRestaurants: false,
    showEmail: false,
    showPhone: false,
    showAddress: false,
    showLocation: false,
  }
) => {
  let res = {
    name: customer.name,
    uid: customer.uid,
  };

  if (options.showFavouriteRestaurants) {
    let favs = await Restaurant.find({
      _id: { $in: customer.favouriteRestaurants },
    });

    res.favouriteRestaurants = [];

    for (let fav of favs) {
      res.favouriteRestaurants.push(await this.formatRestaurant(fav));
    }
  }

  if (options.showEmail) {
    res.email = customer.email;
  }

  if (options.showPhone) {
    res.phone = customer.phone;
  }

  if (options.showAddress && customer.address) {
    res.address = customer.address.text;
  }

  if (options.showLocation && customer.address.lat && customer.address.lon) {
    res.location = {
      lat: customer.address.lat,
      lon: customer.address.lon,
    };
  }

  return res;
};

exports.formatDeliverer = async (
  deliverer,
  options = {
    showWorkingStatus: false,
    showPhone: false,
    showEmail: false,
    showLocation: false,
    showReviews: false,
    showRating: false,
    showPendingMoney: false,
  }
) => {
  let res = {
    name: deliverer.name,
    uid: deliverer.uid,
  };

  if (options.showWorkingStatus) {
    res.workingStatus = deliverer.workingStatus;
  }

  if (options.showPhone) {
    res.phone = deliverer.phone;
  }

  if (options.showEmail) {
    res.email = deliverer.email;
  }

  if (options.showLocation && deliverer.location) {
    res.location = {
      lat: deliverer.location.lat,
      lon: deliverer.location.lon,
    };
  }

  if (options.showReviews) {
    res.reviews = [];
    if (deliverer.reviews) {
      for (let review of deliverer.reviews) {
        let poster = await Customer.findById(review.poster);
        res.reviews.push({
          poster: { name: poster.name, uid: poster.uid },
          rating: review.rating,
          comment: review.review,
        });
      }
    }
  }

  if (options.showRating && deliverer.rating) {
    res.rating = deliverer.rating;
  }

  if (options.showPendingMoney) {
    const orders = await Order.find({
      deliveryBy: deliverer._id,
      isPaid: { $in: [2, 4] },
    });

    res.pendingMoney = 0;

    for (let order of orders) {
      res.pendingMoney += order.total;
    }
  }

  return res;
};

exports.formatManagement = (management) => {
  return {
    name: management.name,
    email: management.email,
    uid: management.uid,
    phone: management.phone,
  };
};
