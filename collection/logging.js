const winston = require("winston");
require("winston-mongodb");

module.exports = function() {
  process.on("uncaughtException", ex => {
    winston.error(ex.message, ex);
  });
  process.on("uncaughtRejection", ex => {
    winston.error(ex.message, ex);
  });

  winston.add(winston.transports.File, { filename: "logfile.log" });
  winston.add(winston.transports.MongoDB, {
    db: "mongodb://localhost:27017/savithri"
  });
};
