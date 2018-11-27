const express = require("express");
const api = express.Router();
const Joi = require("joi");
const debug = require("debug")("app:userApi");

const users = [
  { id: "1", name: "gemini ganesan" },
  { id: "2", name: "saroja devi" },
  { id: "3", name: "soukar janaki" },
  { id: "4", name: "sivaji ganesan" }
];

// api to list all the users
api.get("/", (req, res) => {
  res.json(users);
});

// api to get requested user's name
api.get("/:id", (req, res) => {
  debug("get single user api is working");
  // check availability of user
  const user = users.find(c => c.id === req.params.id);
  // if not found
  if (!user) return res.status(404).send("user not found");

  // if is user is existed

  res.json(user);
});

// api to post => add single user

api.post("/", (req, res) => {
  const { error } = validateUserName(req.body); // this is similar to validationResult.error accesing object destructor
  if (error) return res.sendStatus(400).send(error.details[0].message);

  const singleUser = {
    id: users.length + 1,
    name: req.body.name
  };
  console.log(singleUser);
  users.push(singleUser);
  res.json(singleUser);
});

api.put("/:id", (req, res) => {
  //check for the availability
  //if not found send 404
  const user = users.find(recievedUser => recievedUser.id === req.params.id);
  if (!user) return res.status(404).send("user not found");

  const { error } = validateUserName(req.body); // this is similar to validationResult.error accesing object destructor
  if (error) return res.status(400).send(error.details[0].message);

  //push the change
  user.name = req.body.name;
  res.json(user);
});
api.delete("/:id", (req, res) => {
  const user = users.find(oneUser => oneUser.id === req.params.id);
  if (!user) return res.status(404).send("user not found");

  // delete
  const index = users.indexOf(user);
  users.splice(index, 1);
  res.json(user);
});

function validateUserName(user) {
  //schema is defined set which is compared with recieved object for validation
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(user, schema);
}

module.exports = api;
