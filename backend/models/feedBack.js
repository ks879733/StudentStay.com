const mongoose = require("mongoose");

const feedBackSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", index: true},
  name: { type: String, trim: true, maxlength: 20, required: true },
  email: { type: String, trim: true, lowercase: true },
  message: { type: String, trim: true, minlength: 10, maxlength: 1000, required: true }
}, { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedBackSchema);

module.exports = Feedback