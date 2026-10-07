const express = require("express");
const Feedback = require("../models/feedBack")
const authMiddleware = require("../middleware/auth")
const router = express.Router();

router.post("/suggestion", authMiddleware, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.user.userId
    if(!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Enter your email | name | message"
      })
    }

    const newFeedback = new Feedback({
      user: userId,
      name,
      email,
      message
    });

    await newFeedback.save();
    res.status(201).json({
      success: true,
      message: "Feedback Addedd successfully",
      newFeedback
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in feedback"
    })
  }
  
})

module.exports = router
