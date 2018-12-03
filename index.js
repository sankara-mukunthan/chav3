const config = require("config");
const winston = require("winston");
require("winston-mongodb");
const debug = require("debug")("app:startup");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const moongoose = require("mongoose");
const userApi = require("./api_routes/users");
const authApi = require("./api_routes/auth");
const distributorApi = require("./api_routes/distributors");
const error = require("./middlewares/error");

winston.handleExceptions(
  new winston.transports.File({ filename: "uncaughtExceptions.log" })
);
process.on("uncaughtRejection", ex => {
  throw ex;
});

winston.add(winston.transports.File, { filename: "logfile.log" });
winston.add(winston.transports.MongoDB, {
  db: "mongodb://localhost:27017/savithri"
});
if (!config.get("jwtSecretKey")) {
  debug("FATAL ERROR : secret key needs to be set");
  process.exit(1);
}
//configuration details
console.log(`application name : ${config.get("name")}`);
console.log(`mail server : ${config.get("mail.host")}`);
console.log(`mail pwd : ${config.get("mail.password")}`);

// built-in middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // oldway need to find another solution like body-parser

// thrid-party middleware\
app.use(helmet());
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debug("morgan enabled ...");
}

// database connection
moongoose
  .connect(
    "mongodb://localhost:27017/savithri",
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
  .then(() => console.log("connected to database"))
  .catch(err => console.error(`error in connecting database :${err.message}`));

// view routes
//home route
app.get("/", (req, res) => {
  res.send("engine started ");
});

// api routes
// user
app.use("/api/users", userApi);
debug("authenticating");
app.use("/api/auth", authApi);
app.use("/api/distributors", distributorApi);

//error handling middleware should be after all the controllers and api since we are using next()
// the object on the next will be transfered to below function
app.use(error);
app.listen(port, () => debug(`listening to port: ${port}`));
