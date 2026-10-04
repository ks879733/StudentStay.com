const mongoose = require("mongoose");

const deactivateRequestSchema = new mongoose.Schema({
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
    index: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  reason: {
    type: String,
    trim: true,
    maxlength: 500
  }

}, { timestamps: true });

const DeactivateRequest = mongoose.model("DeactivateRequest",deactivateRequestSchema);
module.exports = DeactivateRequest