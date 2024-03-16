const Deliverer = require("../models/Deliverer");
const jwt = require("jsonwebtoken");

const delivererAuth = async (req, res, next) => {
  if (req.url === "/login" || req.url === "/signup") {
    next();
    return;
  }

  let { authorization: authToken } = req.headers;

  if (!authToken) {
    res.status(401).json({
      success: false,
      error: "Please login to access this.",
    });

    return;
  }

  authToken = authToken.split(" ")[1];

  try {
    const { id } = jwt.verify(authToken, process.env.JWT_SECRET);

    const deliverer = await Deliverer.findById(id);

    if (!deliverer) {
      res.status(401).json({
        success: false,
        error: "Please login to access this.",
      });

      return;
    }

    req.user = deliverer;

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

    return;
  }
};

module.exports = delivererAuth;
