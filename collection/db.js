const moongoose = require("mongoose");
const winston = require("winston");

module.exports = function() {
  // database connection
  moongoose
    .connect(
      "mongodb://localhost:27017/savithri",
      {
        useNewUrlParser: true,
        useCreateIndex: true
      }
    )
    .then(() => winston.info("connected to database"));
};
