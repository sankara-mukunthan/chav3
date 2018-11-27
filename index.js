const config = require("config");
const debug = require("debug")("app:startup");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const logger = require("./middlewares/logger");
const userApi = require("./api_routes/users");
const moongoose = require("mongoose");

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
app.use(function(req, res, next) {
  console.log("authenticating");
  next();
});

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

//user schema
const userSchema = new moongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  mobileNumr: {
    type: Number,
    unique: true,
    required: true
  },
  loginPassword: {
    type: String,
    required: true
  },
  address: {
    doorNumr: String,
    street: String,
    locality: String,
    area: String,
    district: String,
    state: String,
    pincode: { type: Number, required: true }
  },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  isPublished: Boolean
});

// class = human , object = john
//similarly we have to create model with schema (class - pascal case) and instance

const User = moongoose.model("user", userSchema);
// async and await to deal with the async operation .save() since it is gonna take some time
async function createUser() {
  try {
    const user = new User({
      name: "rajini haasan",
      role: "distributor",
      mobileNumr: "9094440009",
      loginPassword: "distest2",
      address: {
        pincode: "600092"
      },
      createdBy: "admin",
      isPublished: true
    });
    // since .save() will return a promise we need to await
    const result = await user.save();
    debug("saved user :", result);
  } catch (err) {
    debug("error in creating user :", err.message);
  }
}
// createUser(); | activate it later

async function getAllUsers() {
  try {
    const users = await User.find()
      .sort({ name: 1 })
      .select({ name: 1, mobileNumr: 1 });
    debug("users list", users);
  } catch (err) {
    debug("error in getting all users", err);
  }
}
getAllUsers();
// api routes
// user
app.use("/api/users", userApi);

app.listen(port, () => console.log(`listening to port: ${port}`));
