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
  modifiedAt: Date,
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
// getAllUsers(); | activate it later

//update single user and id is provided
async function updateuser(id) {
  try {
    const user = await User.findById(id);
    if (!user) return debug("user not found .. update function");
    const result = await user.set({
      mobileNumr: 9488668873
    });
    debug("mobile number updated successfully ", result.mobileNumr);
  } catch (err) {
    debug("error in updating mobile number");
  }
}
// updateuser("5bfbc7c7697f6e04bae5fe62"); | activate it later

// update bunch of user's with criteria or update when id not provided
async function updateusers(id) {
  try {
    //method one that returns result
    // const result = await User.update(
    //   { _id: id },
    //   {
    //     $set: {
    //       mobileNumr: 9677071570
    //     }
    //   }
    // );
    //method two that returns the object
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { mobileNumr: 9488668873 }
      },
      { new: true }
    );
    debug("update successfully", user);
  } catch (err) {
    debug("error 2nd update method");
  }
}
// updateusers("5bfbc7c7697f6e04bae5fe62"); | restore when needed

// remove users using deleteOne or deleteMany or findbyIdAndRemove
async function removeUser(id) {
  try {
    const result = await User.deleteOne({ _id: id });
    debug("deleted successfully", result);
  } catch (err) {
    debug("error in removing user", err);
  }
}

removeUser("5bfbc7c7697f6e04bae5fe62");
// api routes
// user
app.use("/api/users", userApi);

app.listen(port, () => console.log(`listening to port: ${port}`));
