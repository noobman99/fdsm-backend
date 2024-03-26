const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Restaurant = require("../../models/Restaurant");
const { geoCode } = require("../../helpers/maps");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const RandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let randString = "";
  while (randString.length < length) {
    randString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return randString;
};

exports.signUp = async (req, res, next) => {
  let name, email, phone, password, address, timings, tags, image;

  try {
    ({ name, email, phone, password, address, timings, tags, image } =
      req.body);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Invalid Request" });
  }

  if (!name || !email || !password || !address || !timings || !phone) {
    return res.status(400).json({ success: false, error: "Fill all details." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  if (!validator.isMobilePhone(phone)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid phone number" });
  }

  try {
    if (
      timings.open < 0 ||
      timings.close < 0 ||
      timings.open > 24 ||
      timings.close > 24
    ) {
      return res.status(400).json({ success: false, error: "Invalid timings" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid timings" });
  }

  if (typeof address === "string") {
    let adr = encodeURIComponent(address);
    try {
      adr = await geoCode(adr);
      address = { ...adr, text: address };
    } catch (error) {
      return res.status(404).json({ error: "Invalid Address" });
    }
  }

  let restaurant = await Restaurant.findOne({ email });

  if (restaurant) {
    return res
      .status(400)
      .json({ success: false, error: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let uid;
  do {
    uid = "RES" + RandomString(10);
    restaurant = await Restaurant.findOne({ uid });
  } while (restaurant);

  tags = tags.map((tag) => tag[0].toUpperCase() + tag.slice(1).toLowerCase());

  try {
    restaurant = {
      uid,
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      timings,
      tags,
    };

    if (image) {
      restaurant.image = image;
    }

    restaurant = await Restaurant.create(restaurant);

    const token = createToken(restaurant._id);

    res.status(201).json({ success: true, token });
  } catch (error) {
    if (restaurant) {
      await Restaurant.findByIdAndDelete(restaurant._id);
    }
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.logIn = async (req, res, next) => {
  let email, password;

  try {
    ({ email, password } = req.body);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Invalid Request" });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Fill all details." });
  }

  const restaurant = await Restaurant.findOne({ email });
  if (!restaurant) {
    return res
      .status(400)
      .json({ success: false, error: "Email not registered." });
  }

  const validPassword = await bcrypt.compare(password, restaurant.password);
  if (!validPassword) {
    return res.status(400).json({ success: false, error: "Invalid password" });
  }

  const token = createToken(restaurant._id);

  res.status(200).json({ success: true, token });
};

exports.changePassword = async (req, res, next) => {
  let oldPassword, newPassword;

  try {
    ({ oldPassword, newPassword } = req.body);
  } catch (error) {
    return res.status(500).json({ success: false, error: "Invalid Request" });
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Fill all details." });
  }

  const restaurant = req.user;

  const validPassword = await bcrypt.compare(oldPassword, restaurant.password);
  if (!validPassword) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid previous password" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  restaurant.password = hashedPassword;

  await restaurant.save({
    validateBeforeSave: true,
    isNew: false,
  });

  res.status(200).json({ success: true });
};
