const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
   
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    
    lodge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },

   
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    
    occupants: {
      type: Number,
      required: true,
      min: 1,
    },

    
    rentPerMonth: {
      type: Number,
      required: true,
      min: 0,
    },

    
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

   
    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
       type: Date,
       default: null
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

   
    specialRequests: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1, bookingStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);