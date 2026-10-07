const { required } = require("joi");
const mongoose = require("mongoose");

const roomDeactivateRequest = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true
  },
  lodge: {
    type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
  },
  reason: {
    type: String, required: true, trim: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminRemark: {
    type: String,
    default: ""
  },
}, { timestamps: true });

const RoomDeactivateRequest = mongoose.model("RoomDeactivateRequest", roomDeactivateRequest);

module.exports = RoomDeactivateRequest