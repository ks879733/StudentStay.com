const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth")
const razorpay = require("../config/razorpay");
const crypto = require('crypto');
const Room = require("../models/Room")
const Booking = require("../models/Booking")

router.post("/booking/:roomId", authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.roomId
    const { occupants, specialRequests } = req.body

    if(!occupants) {
      return res.status(400).json({
        success: false,
        message: "Occupants are required"
      })
    }
    const room = await Room.findById(roomId).populate("lodge", "status");
    if(!room) {
      return res.status(404).json({
        message: "Room not found"
      })
    }
    if(room.status !== "active") {
      return res.status(400).json({
        message: "Room is not availiable"
      })
    }

    if(room.lodge.status !== "approved") {
      return res.status(400).json({
        message: "Lodge is not approved"
      })
    }
    if(occupants > room.capacity) {
      return res.status(400).json({
        message: `Maximum ${room.capacity} capacity allowed`
      })
    }
    const existingBooking = await Booking.findOne({
      user: req.user.userId,
      room: roomId,
      $or: [
        {
          bookingStatus: "confirmed"
        },
        {
          bookingStatus: "pending",
          expiresAt: { $gt: new Date() }
        }
      ]
    });

    if(existingBooking) {
      return res.status(400).json({
         message: "You already have a booking for this room"
      })
    }
    const bookings = await Booking.find({
      room: roomId,
       $or: [
      {
       bookingStatus: "confirmed"
      },
      {
       bookingStatus: "pending",
       expiresAt: { $gt: new Date() }
      }
    ]
   });
    const occupiedSeats = bookings.reduce((total, booking) => total + booking.occupants, 0);

    if(occupiedSeats + occupants > room.capacity){
       return res.status(400).json({
       message: "Not enough space available"
    });
      }
    const newBooking = new Booking({
      user: req.user.userId,
      lodge: room.lodge._id,
      room: room._id,
      occupants,
      rentPerMonth: room.rentPerMonth,
      totalAmount: room.rentPerMonth,
      specialRequests: specialRequests || "",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10min
    })
    await newBooking.save();
    res.status(201).json({
        success: true,
        message: "Booking created successfully",
        newBooking
      });
  } catch (error) {
     res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
  }
});

router.post("/booking/:bookingId/payment", authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params

  const booking = await Booking.findOne({_id: bookingId, user: req.user.userId});
  if(!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    })
  }
   // User agar room book kiya hoga tavi pending hoga agar pending nhi hoga to  payment nhi hoga
  if(booking.bookingStatus !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Booking is not pending"
    })
  }

  //Agar kisi ne booking pending kiya hua hai or 10 min tak payment nhi karta to aotomatic cancel ho jayega booking

  if(booking.expiresAt && booking.expiresAt < new Date()){
    booking.bookingStatus = "cancelled";
    await booking.save();
    return res.status(400).json({
      success: false,
      message: "Booking has expired"
    })
  }
  if (booking.razorpayOrderId) {
    return res.status(400).json({
      success: false,
      message: "Payment order already created"
  });
}
  const amount = booking.totalAmount * 100
  const order = await razorpay.orders.create({
    amount: amount,
    currency: "INR",
    receipt: booking._id.toString()
  });
  booking.razorpayOrderId = order.id;

  await booking.save();

  res.status(201).json({
    success: true,
    message: "Payment Order Created",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID
  })
  } catch (error) {
    res.status(500).json({
        success: false,
        message: "Payment order creation failed",
        error: error.message
      });
  }

});

router.post("/booking/:bookingId/verify-payment", authMiddleware, async (req, res) => {

  try {
    const { bookingId } = req.params
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    user: req.user.userId
  });
  if(!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    })
  }

  if(booking.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({
      success: false,
      message: "Invalid order"
    })
  }
  if (booking.paymentStatus === "paid") {
    return res.status(400).json({
      success: false,
      message: "Payment already completed"
  });
}
  // Ab signature generate karenge razorpay ke signature se match karne ke liye
  const generateSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");

  if(generateSignature !== razorpay_signature) {
    booking.paymentStatus = "failed";

    await booking.save();

    return res.status(400).json({
      success: false,
      message: "Payment failed"
    })
  }

  //Payment successfull ho gaya
  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";
  booking.amountPaid = booking.totalAmount;
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.expiresAt = null;
  
  await booking.save();

  res.status(200).json({
    success: true,
    message: "Payment confirmed and Booking successfull",
    booking
  });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message
      });
  }
  

})

module.exports = router