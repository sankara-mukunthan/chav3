require("dotenv").config();

const config = {
  mail: {
    password: "MAILPASSWORD"
  },
  jwtSecretKey: "SECRETKEY"
};

module.exports = config;
