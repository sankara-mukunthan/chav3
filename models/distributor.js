const moongoose = require("mongoose");
const { userSchema } = require("./user");

//distributor schema
const distributorSchema = new moongoose.Schema({
  bizName: String,
  user: { type: userSchema, required: true },
  customers: []
});
const Distributor = moongoose.model("Distributor", distributorSchema);

exports.Distributor = Distributor;
