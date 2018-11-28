const moongoose = require("mongoose");
//distributor schema

const Distributor = moongoose.model(
  "distributor",
  new moongoose.Schema({
    dpassword: {
      type: String,
      required: true
    },
    bizName: {},
    customers: [],
    user: {
      name: {
        type: String,
        required: true
      },
      mobileNumr: {
        type: Number,
        required: true,
        unique: true
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
    }
  })
);

exports.Distributor = Distributor;
