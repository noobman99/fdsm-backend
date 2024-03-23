const Customer = require("../models/Customer");
const Restaurant = require("../models/Restaurant");
const Deliverer = require("../models/Deliverer");
const Dish = require("../models/Dish");

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
    uid: dish.id,
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

exports.formatOrder = async (order, options = { showOtp: false }) => {
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
    customer: await this.formatCustomer(customer),
    restaurant: await this.formatRestaurant(restaurant, {
      showPhone: true,
      showAddress: true,
    }),
    deliverer: await this.formatDeliverer(deliverer, {
      showPhone: true,
      showLocation: true,
    }),
    deliveryAddress: order.deliveryAddress,
    items,
    total: order.total,
    isPaid: order.isPaid,
    uid: order.id,
    isCompleted: order.isCompleted,
    orderTime: order._id.getTimestamp(),
  };

  if (options.showOtp && !order.isCompleted) {
    res.otp = order.otp;
    res.etd = order.etd;
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
    res.timings = restaurant.timings;
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

    for (let item of restaurant.menu) {
      let dish = await Dish.findById(item);

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

  return res;
};

exports.formatCustomer = async (
  customer,
  options = {
    showFavouriteRestaurants: false,
    showEmail: false,
    showPhone: false,
    showAddress: false,
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

  if (options.showLocation && res.location) {
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
