const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true, match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"] },
  password: { type: String, required: true, minlength: 6, },
  role: { type: String, enum: ["admin", "owner", "user"], default: "user" },
  address: {
    street: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
  },
  refreshToken: { type: String, default: null },
  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;