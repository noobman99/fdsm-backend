const Management = require("../models/management");
const jwt = require("jsonwebtoken");

const managementAuth = async (req, res, next) => {
  if (req.url === "/management/login" || req.url === "/management/signup") {
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

    const management = await Management.findById(id);

    if (!management) {
      res.status(401).json({
        success: false,
        error: "Please login to access this.",
      });
    }

    req.user = management;

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

module.exports = managementAuth;
