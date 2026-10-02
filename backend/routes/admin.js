const express = require("express");
const authMidlleware = require("../middleware/auth");
const router = express.Router();
const Lodge = require("../models/lodge");
const User = require("../models/User")
const adminMiddleware = require("../middleware/admin");
const { default: mongoose } = require("mongoose");
router.get("/pending-lodge", authMidlleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);

    const skip = (page - 1) * limit

    const lodges = await Lodge.find({ status: "pending" }).populate("owner", "name email phone").sort({createdAt: -1}).skip(skip).limit(limit);

    
    res.status(200).json({
      success: true,
      count: lodges.length,
      lodges
    })

  } catch (error) {
    console.error("Get pending lodge error", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending lodges"
    });
  }
});
 //ye API lodge approved karne ke liye
router.patch("/lodges/:lodgeId/approve", authMidlleware, adminMiddleware, async (req, res) => {
  try {
    const lodgeId = req.params.lodgeId;
    if(!mongoose.Schema.Types.ObjectId.isValid(lodgeId)){
      return res.status(400).json({
        success: false,
        message: "Inavlid lodge ID"
      });
    }

    const lodge = await Lodge.findOneAndUpdate({ _id: lodgeId, status: "pending" }, { status: "approved" },
      { new: true, runValidators: true }
    );

    if(!lodge) {
      return res.status(404).json({
        success: false,
        message: "Pending lodge not found",
      });
    }

    res.status(200).json({
      success: true, 
      message: "Lodge approved successfully",
      lodge
    })
  } catch (error) {
    console.error("Approved lodge error",error);
    res.status(500).json({
      success: false,
      message: "Failed to approved lodge",
    })
  }
});

// ye API lodge reject karne ke liye
router.patch("/lodge/:lodgeId/reject-lodge", authMidlleware, adminMiddleware, async (req, res) =>{
  try {
    const lodgeId = req.params.lodgeId;

    if(!mongoose.Types.ObjectId.isValid(lodgeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lodge ID",
      });
    }

    const lodge = await Lodge.findOneAndUpdate(
      { _id: lodgeId, status: "pending" },
      { status: "rejected" },
      { new: true, runValidators: true }
    );

    if(!lodge) {
      return res.status(404).json({
        success: false,
        message: "Pending lodge not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lodge rejected successfully",
      lodge,
    });
  } catch (error) {
    console.error("Reject Lodge Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject lodge",
    });
  }
});

//All user show karne ke liye
router.get("/all-users",authMidlleware,adminMiddleware,async (req, res) => {
    try {
      const users = await User.find().select("-password -refreshToken -isVerified");

      if (users.length === 0) {
        return res.status(404).json({
          message: "Users not found"
        });
      }

      res.status(200).json({
        count: users.length,
        users
      });

    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
);
module.exports = router