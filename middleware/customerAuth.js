const Customer = require("../models/Customer");
const jwt = require("jsonwebtoken");

const customerAuth = async (req, res, next) => {
  if (req.url === "/customer/login" || req.url === "/customer/signup") {
    next();
    return;
  }

  let { authorization: authToken } = req.headers;

  if (!authToken) {
    res.status(401).json({
      success: false,
      error: "Please login to access this.",
    });
  }

  authToken = authToken.split(" ")[1];

  try {
    const { id } = jwt.verify(authToken, process.env.JWT_SECRET);

    const customer = await Customer.findById(id);

    if (!customer) {
      res.status(401).json({
        success: false,
        error: "Please login to access this.",
      });
    }

    req.user = customer;

    next();
  } catch (error) {
    if (err.name === "TokenExpiredError") {
      res.status(801).json({
        success: false,
        error: "Login Session expired. Please login again.",
      });
    } else if (err.name === "JsonWebTokenError") {
      res.status(800).json({
        success: false,
        error: "Invalid credentials. Please login again.",
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Server could not process your request at this time.",
      });
    }
  }
};

module.exports = customerAuth;