const moongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

//user schema
const userSchema = new moongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobileNumr: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // photo: {
  //   data: Buffer,
  //   contentType: String
  // },
  idProof: {
    proofType: {
      type: String,
      enum: ["driving liscence, aadhar card, voter id"]
    },
    proofId: String
    // proofPhoto: {
    //   data: Buffer,
    //   contentType: String
    // }
  },
  address: {
    line1: String,
    line2: String,
    area: String,
    district: String,
    state: String,
    pincode: {
      type: Number,
      required: true
    }
  }
});

userSchema.methods.genAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get("jwtSecretKey"));
  return token;
};

const User = moongoose.model("user", userSchema);

exports.userSchema = userSchema;
exports.User = User;
