const mongoose = require("mongoose");

const lodgeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  type: {
    type: String,
    enum: ["lodge", "hostel"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 3000,
    default: "",
  },
  address: {
    street: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, trim: true, default: "India" },
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true,
  },
  amenities: {
    type: [String],
    default: [],
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      }
    }
  ],
  rules: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "inactive", "maintenence"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Property", lodgeSchema);
