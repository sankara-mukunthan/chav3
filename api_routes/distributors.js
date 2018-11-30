const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:distributorApi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authorize = require("../middlewares/authorize");
const adminAuth = require("../middlewares/adminAuth");
const { User } = require("../models/user");

const { Distributor } = require("../models/distributor"); // orelse we have use like distributor.Distributor everywere so we are destructuring

// api to list all the distributors
api.get("/", authorize, async (req, res) => {
  try {
    const distributors = await Distributor.find().sort("name");
    if (!distributors)
      return debug("there are no distributors please add an distributor");
    res.json(distributors);
  } catch (err) {
    debug("error in api getting all distributors", err.message);
  }
});

// api to get requested distributor's name
api.get("/:id", async (req, res) => {
  const distributor = Distributor.find(c => c.id === req.params.id);
  if (!distributor) return res.status(404).send("distributor not found");

  try {
    res.json(distributor);
  } catch (err) {
    debug("error in api getting single distributor", err.message);
  }
});

// api to post => add single distributor

api.post("/", [authorize, adminAuth], async (req, res) => {
  try {
    const { error } = validateDistributor(req.body); // this is similar to validationResult.error accesing object destructor
    if (error) return res.status(400).json(error.details[0].message);
    // Checking the availability of the user
    let checkuser = await User.findOne({
      mobileNumr: req.body.user.mobilenumr
    });
    if (checkuser) return res.send("mobile numr is already exists");

    const user = await fromUser(req.body.user);
    if (!user) return debug("fatal error deal with user creation");

    let singleDistributor = new Distributor({
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
    const salt = await bcrypt.genSalt(9);
    singleDistributor.user.password = await bcrypt.hash(
      singleDistributor.user.password,
      salt
    );
    singleDistributor = await singleDistributor.save();
    const token = user.genAuthToken();
    res
      .header("x-auth-token", token)
      .json(
        _.pick(singleDistributor, [
          "bizName",
          "user.password",
          "user.mobileNumr",
          "customers"
        ])
      );
    //_ lets us pick only what is needed same can be used in to replace req.body which repeated above
  } catch (err) {
    debug("error in api posting single distributor", err.message);
  }
});

// api.put("/:id", async (req, res) => {
// this is similar to validationResult.error accesing object destructor
//   const { error } = validateNameNumr(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   try {
//     const distributor = await Distributor.findByIdAndUpdate(
//       req.params.id,
//       { name: req.body.name, mobileNumr: req.body.mobilenumr },
//       { new: true }
//     );
//     if (!distributor) return res.status(404).send("distributor not found");
//     res.json(distributor);
//   } catch (err) {
//     debug("error in api update distributor", err.message);
//   }
// });

// api.delete("/:id", async (req, res) => {
//   try {
//     const distributor = await Distributor.findByIdAndRemove(req.params.id);
//     if (!distributor) return res.status(404).send("distributor not found");
//     res.json(distributor);
//   } catch (err) {
//     debug("error in api deleting single distributor", err.message);
//   }
// });

async function fromUser(user) {
  try {
    const { error } = validateUser(user); // this is similar to validationResult.error accesing object destructor
    if (error) return debug(error.details[0].message);

    //if user doesnt found carry on to create a user
    let singleUser = new User({
      name: user.name,
      mobileNumr: user.mobilenumr,
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
    });
    const salt = await bcrypt.genSalt(9);
    singleUser.password = await bcrypt.hash(singleUser.password, salt);
    singleUser = await singleUser.save();
    return singleUser;
  } catch (err) {
    debug("error in api distributor user first creation:", err);
  }
}

function validateUser(user) {
  //schema is defined set which is compared with recieved object for validation
  // to validate the incoming
  const schema = {
    name: Joi.string()
      .min(3)
      .required(),
    mobilenumr: Joi.number().required(),
    password: Joi.string().required(),
    idProof: {
      proofType: Joi.string().required(),
      proofId: Joi.string().required()
    },
    address: {
      line1: Joi.string().required(),
      line2: Joi.string().required(),
      area: Joi.string().required(),
      district: Joi.string().required(),
      state: Joi.string().required(),
      pincode: Joi.number().required()
    }
  };
  return Joi.validate(user, schema);
}
function validateDistributor(distributor) {
  //schema is defined set which is compared with recieved object for validation
  // to validate the incoming
  const schema = {
    bizName: Joi.string()
      .min(3)
      .required(),
    user: Joi.required(),
    customers: Joi.array().min(1)
  };

  return Joi.validate(distributor, schema);
}

function validateNameNumr(distributor) {
  const schema = {
    name: Joi.string().required(),
    mobilenumr: Joi.number().required()
  };

  return Joi.validate(distributor, schema);
}
module.exports = api;
