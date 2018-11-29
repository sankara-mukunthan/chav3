const moongoose = require("mongoose");
const { userSchema } = require("./user");
//distributor schema

const Distributor = moongoose.model(
  "distributor",
  new moongoose.Schema({
    bizName: String,
    user: { type: userSchema, required: true },
    customers: []
  })
);

exports.Distributor = Distributor;
