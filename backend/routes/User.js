const express = require("express")
const User = require("../models/User");
const router = express.Router()
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const lodge = require("../models/lodge");
const Room = require("../models/Room");
const authMidlleware = require("../middleware/auth");
const Booking = require("../models/Booking");
router.post("/register", async (req, res) => {

  try {
    const { name, email, phone, password } = req.body;
    if(!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please enter all the required field"
      });
    }
  
    const user = await User.findOne({ email: email.toLowerCase().trim(), phone });
    if(user) {
      return res.status(400).json({
        success: false,
        message: "User Already exist",
        
      });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user"
    });
  
    const accessToken = jwt.sign({
      userId: newUser._id,
      role: newUser.role
    }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "15m" });
  
    const refreshToken = jwt.sign({
      userId: newUser._id,
    }, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" });
    
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    newUser.refreshToken = hashedRefreshToken
  
    await newUser.save();

    res.cookie("refreshToken", refreshToken, {
       httpOnly: true,
       secure: false,
       sameSite: "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.status(201).json({success: true, message: "Registration successfull",
      accessToken,
      user :{
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    })
    
  } catch (error) {
    console.error("Registration Error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {

  try {
    const { email, password } = req.body;

  if(!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password"
    });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if(!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    })
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if(!user || !isValidPassword) {
    return res.status(404).json({
      success: false,
      message: "Invalid credential"
    });
  }

  const accessToken = jwt.sign( {
    userId: user._id,
    role: user.role
  },
   process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({
    userId: user._id,
  },
   process.env.JWT_REFRESH_TOKEN, 
   { expiresIn: "7d" }
  );

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login Successfully",
    accessToken,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
  

 });

 router.post("/refresh", async (req, res) => {
  const userRefreshToken = req.cookies.refreshToken;
  if(!userRefreshToken) return res.status(404).json({message: "Refresh Token not found"})
  let decodedUser
  try {
    decodedUser = jwt.verify(userRefreshToken, process.env.JWT_REFRESH_TOKEN);
    
  } catch (error) {
    return res.status(403).json({message: "Invalid refreshToken"});
  }

  const user = await User.findById(decodedUser.userId);
  if(!user) return res.status(404).json({message: "User Not found"})

  if(!user.refreshToken) {
    return res.status(403).json({message: "refresh token is not valid"});
  }

  const isValid = await bcrypt.compare(userRefreshToken, user.refreshToken);
  if(!isValid) {  
    return res.status(403).json({message: "refresh token is not valid"});
  }

  const accessToken = jwt.sign( {
    userId: user._id,
    role: user.role
  },
   process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({
    userId: user._id,
  },
   process.env.JWT_REFRESH_TOKEN, 
   { expiresIn: "7d" }
  );
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ accessToken });
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
        const user = await User.findById(decoded.userId);

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch (error) {
        console.log("Logout token verification failed:", error.message);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

router.get("/userdetail", authMidlleware, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
router.get("/all-properties", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit
    const totalProperties = await lodge.countDocuments({
      status: "approved"
    });

    const properties = await lodge.find({
      status: "approved"
    }).sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        limit: limit,
        totalProperties: totalProperties,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },

      properties
    })
  } catch (error) {
    
  }
});

router.get("/lodges/:lodgeId/rooms", async (req, res) => {
  try {
    const { lodgeId } = req.params;

    
    const property = await lodge.findOne({
      _id: lodgeId,
      status: "approved"
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Approved lodge not found"
      });
    }

    
    const rooms = await Room
      .find({
        lodge: lodgeId
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      lodge: property,
      rooms
    });

  } catch (error) {
    console.error("Get lodge rooms error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get lodge rooms"
    });
  }
});

router.get("/my-booking", authMidlleware, async (req, res) => {
  try {
    const booking = await Booking.find({
        user: req.user.userId
    }).populate("lodge", "name type address contactPhone images").populate("room", "roomNumber roomType sharingType capacity rentPerMonth roomImage").sort({createdAt: -1});

    res.status(200).json({
      success: true,
      count: booking.length,
      booking
    })

  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Failed to get bookings",
      error: error.message
    });
  }
});

router.get("/my-booking/:bookingId", authMidlleware, async (req, res) => {
  try {
    const  { bookingId } = req.params;
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.userId
    }).populate("lodge", "name type address contactPhone images").populate("room", "roomNumber roomType sharingType capacity rentPerMonth roomImage");

    if(!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    res.status(200).json({
      success: true,
      booking
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get booking",
      error: error.message
    });
  }
  
})



module.exports = router