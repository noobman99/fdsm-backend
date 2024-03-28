const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const bodyParser = require("body-parser");

const customerApi = require("./routes/customer/api");
const restaurantApi = require("./routes/restaurant/api");
const delivererApi = require("./routes/deliverer/api");
const managementApi = require("./routes/management/api");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = 3000;

// Middleware
try {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Enable CORS
  app.use(cors());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });
} catch (error) {
  console.log(error);
}

// Routes
app.use("/api/customer", customerApi);
app.use("/api/restaurant", restaurantApi);
app.use("/api/delivery-agent", delivererApi);
app.use("/api/management", managementApi);

// image route
app.use("/assets/images", express.static("assets/images"));

// test route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

console.log("connecting to", process.env.MONGO_DB_URI);

mongoose.connect(process.env.MONGO_DB_URI).then(() => {
  console.log("Connected to MongoDB");

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
