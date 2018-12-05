const moongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function() {
  const db = config.get("db");
  console.log(db);
  // database connection
  moongoose
    .connect(
      db,
      {
        useNewUrlParser: true,
        useCreateIndex: true
      }
    )
    .then(() => winston.info(`connected to ${db}`));
};
