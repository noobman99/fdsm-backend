const express = require("express");

// Create Express app
const app = express();
const port = 3000;

// Define a sample route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
