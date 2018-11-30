const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:userApi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const config = require("config");
const authorize = require("../middlewares/authorize");
const { User } = require("../models/user"); // orelse we have use like user.User everywere so we are destructuring

// api to list all the users
api.get("/", authorize, async (req, res) => {
  try {
    const users = await User.find()
      .sort("name")
      .select("-password");
    if (!users) return debug("there are no users please add an user");
    res.json(users);
  } catch (err) {
    debug("error in api getting all users", err.message);
  }
});

// api to get requested user's name
api.get("/:id", async (req, res) => {
  const user = User.find(c => c.id === req.params.id);
  if (!user) return res.status(404).send("user not found");

  try {
    res.json(user);
  } catch (err) {
    debug("error in api getting single user", err.message);
  }
});

// api to post => add single user

api.post("/", async (req, res) => {
  const { error } = validateUser(req.body); // this is similar to validationResult.error accesing object destructor
  if (error) return res.status(400).json(error.details[0].message);

  let user = await User.findOne({ mobileNumr: req.body.mobilenumr });
  if (user) return res.status(400).send("mobile numr is already exists");

  let singleUser = new User({
    name: req.body.name,
    mobileNumr: req.body.mobilenumr,
    password: req.body.password,
    address: {
      pincode: req.body.address.pincode
    }
  });
  try {
    const salt = await bcrypt.genSalt(9);
    singleUser.password = await bcrypt.hash(singleUser.password, salt);
    singleUser = await singleUser.save();
    const token = user.genAuthToken();
    res
      .header("x-auth-token", token)
      .json(_.pick(singleUser, ["password", "name", "mobileNumr"]));
    //_ lets us pick only what is needed same can be used in to replace req.body which repeated above
  } catch (err) {
    debug("error in api posting single user:", err.message);
  }
});

api.put("/:id", async (req, res) => {
  // this is similar to validationResult.error accesing object destructor
  const { error } = validateNameNumr(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, mobileNumr: req.body.mobilenumr },
      { new: true }
    );
    if (!user) return res.status(404).send("user not found");
    res.json(user);
  } catch (err) {
    debug("error in api update user:", err.message);
  }
});

api.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("user not found");
    res.json(user);
  } catch (err) {
    debug("error in api deleting single user", err.message);
  }
});

function validateUser(user) {
  //schema is defined set which is compared with recieved object for validation
  // to validate the incoming
  const schema = {
    name: Joi.string()
      .min(3)
      .required(),
    mobilenumr: Joi.number().required(),
    password: Joi.string().required(),
    address: {
      pincode: Joi.number().required()
    }
  };

  return Joi.validate(user, schema);
}

function validateNameNumr(user) {
  const schema = {
    name: Joi.string().required(),
    mobilenumr: Joi.number().required()
  };

  return Joi.validate(user, schema);
}
module.exports = api;
