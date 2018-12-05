const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const app = express();
const winston = require("winston");

// built-in middleware
app.use(express.static("public"));
app.use(helmet());
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
}

require("./collection/db")();
require("./collection/routes")(app);
require("./collection/logging")();
require("./collection/config")();

// view routes
//home route
app.get("/", (req, res) => {
  res.send("engine started ");
});
const port = process.env.PORT || 3020;
app.listen(port, () => winston.info(`listening to port: ${port}`));
