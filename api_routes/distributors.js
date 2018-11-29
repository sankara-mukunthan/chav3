const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:distibutorApi");
const bcrypt = require("bcrypt");
import validateUser from "../api_routes/users";
const User = require("./users");
const { Distibutor } = require("../models/distributor"); // orelse we have use like distibutor.Distibutor everywere so we are destructuring

// api to list all the distibutors
api.get("/", async (req, res) => {
  try {
    const distibutors = await Distibutor.find().sort("name");
    if (!distibutors)
      return debug("there are no distibutors please add an distibutor");
    res.json(distibutors);
  } catch (err) {
    debug("error in api getting all distibutors", err.message);
  }
});

// api to get requested distibutor's name
api.get("/:id", async (req, res) => {
  const distibutor = Distibutor.find(c => c.id === req.params.id);
  if (!distibutor) return res.status(404).send("distibutor not found");

  try {
    res.json(distibutor);
  } catch (err) {
    debug("error in api getting single distibutor", err.message);
  }
});

// api to post => add single distibutor

api.post("/", async (req, res) => {
  try {
    const { error } = validateDistibutor(req.body); // this is similar to validationResult.error accesing object destructor
    if (error) return res.status(400).json(error.details[0].message);

    const user = fromUser(req.body.user);
    if (!user) return debug("fatal error deal with user creation");

    let singleDistibutor = new Distibutor({
      bizName: req.body.name,
      user: {
        _id: user._id,
        name: user.name,
        mobileNumr: user.mobileNumr,
        password: user.password,
        idProof: {
          proofType: user.idProof.proofType,
          proofId: user.idProof.proofId
        },
        address: {
          line1: user.address.line1,
          line2: user.address.line2,
          area: user.address.area,
          district: user.address.district,
          state: user.address.state,
          pincode: user.address.pincode
        }
      },
      customers: [req.body.customers]
    });

    singleDistibutor = await singleDistibutor.save();
    res.json(singleDistibutor);
  } catch (err) {
    debug("error in api posting single distibutor", err.message);
  }
});

// api.put("/:id", async (req, res) => {
// this is similar to validationResult.error accesing object destructor
//   const { error } = validateNameNumr(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   try {
//     const distibutor = await Distibutor.findByIdAndUpdate(
//       req.params.id,
//       { name: req.body.name, mobileNumr: req.body.mobilenumr },
//       { new: true }
//     );
//     if (!distibutor) return res.status(404).send("distibutor not found");
//     res.json(distibutor);
//   } catch (err) {
//     debug("error in api update distibutor", err.message);
//   }
// });

// api.delete("/:id", async (req, res) => {
//   try {
//     const distibutor = await Distibutor.findByIdAndRemove(req.params.id);
//     if (!distibutor) return res.status(404).send("distibutor not found");
//     res.json(distibutor);
//   } catch (err) {
//     debug("error in api deleting single distibutor", err.message);
//   }
// });

async function fromUser(user) {
  try {
    const { error } = validateUser(user); // this is similar to validationResult.error accesing object destructor
    if (error) return debug(error.details[0].message);
    // Checking the availability of the user
    let user = await User.findOne({ mobileNumr: rec.user.mobilenumr });
    if (user) return debug("mobile numr is already exists");
    //if user doesnt found carry on to create a user
    let singleUser = new User({
      name: user.name,
      mobileNumr: user.mobilenumr,
      password: password,
      idProof: {
        proofType: user.idProof.proofType,
        proofId: user.idProof.proofId
      },
      address: {
        line1: user.address.line1,
        line2: user.address.line2,
        area: user.address.area,
        district: user.address.district,
        state: user.address.state,
        pincode: user.address.pincode
      }
    });
    const salt = await bcrypt.genSalt(9);
    singleUser.password = await bcrypt.hash(singleUser.password, salt);
    singleUser = await singleUser.save();

    return singleUser;
  } catch (err) {
    debug("error in api distributor user first creation:", err);
  }
}

function validateDistibutor(distibutor) {
  //schema is defined set which is compared with recieved object for validation
  // to validate the incoming
  const schema = {
    bizName: Joi.string()
      .min(3)
      .required(),
    user: Joi.required(),
    customers: Joi.array().min(1)
  };

  return Joi.validate(distibutor, schema);
}

function validateNameNumr(distibutor) {
  const schema = {
    name: Joi.string().required(),
    mobilenumr: Joi.number().required()
  };

  return Joi.validate(distibutor, schema);
}
module.exports = api;
