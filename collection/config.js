const config = require("config");
module.exports = function() {
  if (!config.get("jwtSecretKey")) {
    throw new error("FATAL ERRO: jwtSecretKey is not defined");
  }
};
