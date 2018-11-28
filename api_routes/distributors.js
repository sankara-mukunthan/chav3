const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:distibutorApi");
const { Distibutor } = require("../models/distibutor"); // orelse we have use like distibutor.Distibutor everywere so we are destructuring

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
  const { error } = validateDistibutor(req.body); // this is similar to validationResult.error accesing object destructor
  if (error) return res.status(400).json(error.details[0].message);

  let singleDistibutor = new Distibutor({
    name: req.body.name,
    mobileNumr: req.body.mobilenumr,
    password: req.body.password,
    address: {
      pincode: req.body.address.pincode
    }
  });
  try {
    singleDistibutor = await singleDistibutor.save();
    res.json(singleDistibutor);
  } catch (err) {
    debug("error in api posting single distibutor", err.message);
  }
});

api.put("/:id", async (req, res) => {
  // this is similar to validationResult.error accesing object destructor
  const { error } = validateNameNumr(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const distibutor = await Distibutor.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, mobileNumr: req.body.mobilenumr },
      { new: true }
    );
    if (!distibutor) return res.status(404).send("distibutor not found");
    res.json(distibutor);
  } catch (err) {
    debug("error in api update distibutor", err.message);
  }
});

api.delete("/:id", async (req, res) => {
  try {
    const distibutor = await Distibutor.findByIdAndRemove(req.params.id);
    if (!distibutor) return res.status(404).send("distibutor not found");
    res.json(distibutor);
  } catch (err) {
    debug("error in api deleting single distibutor", err.message);
  }
});

function validateDistibutor(distibutor) {
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
