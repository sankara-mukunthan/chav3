const config = require("config");
const debug = require("debug")("app:startup");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("./middlewares/logger");
const moongoose = require("mongoose");
const userApi = require("./api_routes/users");
const authApi = require("./api_routes/auth");
const distributorApi = require("./api_routes/distributors");

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

//custom middleware
app.use(logger);

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
  .catch(err => console.error(`error in databased connection : ${err}`));

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

app.listen(port, () => debug(`listening to port: ${port}`));
