const express = require("express");
const userApi = require("../api_routes/users");
const authApi = require("../api_routes/auth");
const distributorApi = require("../api_routes/distributors");
const error = require("../middlewares/error");

module.exports = function(app) {
  // api routes
  // user
  app.use(express.json());
  app.use("/api/users", userApi);
  app.use("/api/auth", authApi);
  app.use("/api/distributors", distributorApi);

  //error handling middleware should be after all the controllers and api since we are using next()
  // the object on the next will be transfered to below function
  app.use(error);
};
