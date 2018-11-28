const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:authApi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user"); // orelse we have use like user.User everywere so we are destructuring

//login api to authenticate user

api.post("/", async (req, res) => {
  const { error } = validateUser(req.body); // this is similar to validationResult.error accesing object destructor
  if (error) return res.status(400).json(error.details[0].message);

  let user = await User.findOne({ mobileNumr: req.body.mobilenumr });
  if (!user) return res.status(400).send("invalid username or password");
  try {
    // checking if password is right
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("invalid username or password");
    const secretKey = user.password;
    const token = jwt.sign({ _id: user._id }, secretKey);
    res.json(token);
    //_ lets us pick only what is needed same can be used in to replace req.body which repeated above
  } catch (err) {
    debug("error in api auth:", err.message);
  }
});

function validateUser(user) {
  //schema is defined set which is compared with recieved object for validation
  // to validate the incoming
  const schema = {
    mobilenumr: Joi.number().required(),
    password: Joi.string().required()
  };

  return Joi.validate(user, schema);
}

module.exports = api;
