const moongoose = require("mongoose");
//user schema

const User = moongoose.model(
  "user",
  new moongoose.Schema({
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
    photo: {
      data: Buffer,
      contentType: String
    },
    idProof: {
      proofType: {
        type: String,
        enum: ["driving liscence, aadhar card, voter id"]
      },
      proofId: String,
      proofPhoto: {
        data: Buffer,
        contentType: String
      }
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
  })
);

exports.User = User;
