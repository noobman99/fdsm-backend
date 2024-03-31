const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Deliverer = require("../../models/Deliverer");

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
  let name, email, phone, password;

  try {
    ({ name, email, phone, password } = req.body);
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid Request" });
  }

  if (!name || !email || !password) {
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

  let deliverer = await Deliverer.findOne({ email });

  if (deliverer) {
    return res
      .status(406)
      .json({ success: false, error: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let uid;
  do {
    uid = "DEL" + RandomString(10);
    deliverer = await Deliverer.findOne({ uid });
  } while (deliverer);

  try {
    deliverer = await Deliverer.create({
      uid,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = createToken(deliverer._id);

    res.status(201).json({ success: true, token });
  } catch (error) {
    if (deliverer) {
      await Deliverer.findByIdAndDelete(deliverer._id);
    }
    console.log(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.logIn = async (req, res, next) => {
  let email, password;

  try {
    ({ email, password } = req.body);
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid Request" });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Fill all details." });
  }

  const deliverer = await Deliverer.findOne({ email });
  if (!deliverer) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  const validPassword = await bcrypt.compare(password, deliverer.password);
  if (!validPassword) {
    return res.status(400).json({ success: false, error: "Invalid password" });
  }

  const token = createToken(deliverer._id);

  res.status(200).json({ success: true, token });
};

exports.changePassword = async (req, res, next) => {
  let oldPassword, newPassword;

  try {
    ({ oldPassword, newPassword } = req.body);
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid Request" });
  }

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Fill all details." });
  }

  const deliverer = req.user;

  const validPassword = await bcrypt.compare(oldPassword, deliverer.password);
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
