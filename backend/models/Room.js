const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  lodge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
    index: true,
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
  },
  roomType: {
    type: String,
    enum: ["single", "double", "twin"],
    default: "single",
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  beds: {
    type: Number,
    default: 1,
    min: 1,
  },
  rentPerMonth: {
  type: Number,
  required: true,
  min: 0,
  }, 
  sharingType: {
  type: String,
  enum: ["single", "double", "triple", "four"],
  default: "single",
  },
  amenities: {
    type: [String],
    default: [],
  },
  roomImage: [
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
  status: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active",
  },
  occupiedSeats: {
  type: Number,
  default: 0,
  min: 0
}
}, { timestamps: true });

// A room number only needs to be unique within its lodge.
roomSchema.index({ lodge: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
