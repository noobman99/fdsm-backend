const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../../models/Customer");

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
  const { name, email, phone, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ success: false, error: "Fill all details." });
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ success: false, error: "Invalid email" });
  }

  if (!validator.isMobilePhone(phone)) {
    res.status(400).json({ success: false, error: "Invalid phone number" });
  }

  let customer = await Customer.findOne({ email });

  if (customer) {
    res.status(400).json({ success: false, error: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let uid;
  do {
    uid = "CUS" + RandomString(10);
    customer = await Customer.findOne({ uid });
  } while (customer);

  try {
    customer = await Customer.create({
      uid,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = createToken(customer._id);

    res.status(201).json({ success: true, token });
  } catch (error) {
    if (customer) {
      await Customer.findByIdAndDelete(customer._id);
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: "Fill all details." });
  }

  const customer = await Customer.findOne({ email });
  if (!customer) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  const validPassword = await bcrypt.compare(password, customer.password);
  if (!validPassword) {
    return res.status(400).json({ success: false, error: "Invalid password" });
  }

  const token = createToken(customer._id);

  res.status(200).json({ success: true, token });
};

exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ success: false, error: "Fill all details." });
  }

  const customer = req.user;

  const validPassword = await bcrypt.compare(oldPassword, customer.password);
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
