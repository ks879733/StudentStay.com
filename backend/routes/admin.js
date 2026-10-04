const express = require("express");
const authMidlleware = require("../middleware/auth");
const router = express.Router();
const Lodge = require("../models/lodge");
const User = require("../models/User")
const adminMiddleware = require("../middleware/admin");
const { default: mongoose } = require("mongoose");
const DeactivateRequest = require("../models/deactivateRequest");
const Room = require("../models/Room");
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

router.get("/pending-deactivation-requests", authMidlleware, adminMiddleware, async (req, res) => {
  try {
    const requests = await DeactivateRequest.find({ status: "pending" })
      .populate("owner", "name email phone")
      .populate("lodge", "name type address owner status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get pending deactivation requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending deactivation requests",
    });
  }
});

router.patch("/approve-deactivation/:requestId", authMidlleware, adminMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await DeactivateRequest.findOne({_id: requestId, status: "pending"});
    if(!request) {
      return res.status(400).json({
        succes: false,
        message: "Wait for for admin approval"
      })
    }
    const property = await Lodge.findById(request.lodge);
    if(!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }
    property.status = "inactive";
    await property.save();
    await Room.updateMany(
      {
        lodge: property._id
      },
      {
        $set: { status: "inactive" }
      }
    );
    request.status = "approved"
    await request.save();
    return res.status(200).json({
        success: true,
        message: "Lodge deactivated successfully"
      }); 
  } catch (error) {
    console.error("Approve Deactivation Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to approve deactivation"
      });
  }
});


router.patch(
  "/reject-deactivation/:requestId",
  authMidlleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const request = await DeactivateRequest.findOne({
        _id: req.params.requestId,
        status: "pending"
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found or already processed"
        });
      }

      request.status = "rejected";
      await request.save();

      return res.status(200).json({
        success: true,
        message: "Deactivation request rejected"
      });

    } catch (error) {
      console.error("Reject Deactivation Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reject request"
      });
    }
  }
);

module.exports = router;