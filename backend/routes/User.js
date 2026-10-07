const express = require("express")
const User = require("../models/User");
const router = express.Router()
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const lodge = require("../models/lodge");
const Room = require("../models/Room");
const authMidlleware = require("../middleware/auth");
const Booking = require("../models/Booking");
const loginLimiter = require("../middleware/rateLimit");
const registerLimiter = require("../middleware/registerRateLimit");
const {otpLimiter, resendOtpLimit} = require("../middleware/otpLimiter")
const generateOTP = require("../utils/generateOtp")
const { redisClient } = require("../config/redis");
const sendOTPEmail = require("../utils/sendEmail")


const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

router.post("/register",registerLimiter, async (req, res) => {

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
        role: newUser.role,
        isVerified: newUser.isVerified
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

router.post("/login",loginLimiter, async (req, res) => {

  try {
    
    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid input"
        });
    }
    const { email, password } = value;
  
  
  const user = await User.findOne({ email});
  if(!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid email or password"
    })
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if(!isValidPassword) {
    return res.status(404).json({
      success: false,
      message: "Invalid credential"
    });
  }

   const otp = generateOTP();

    await redisClient.set(
      `LoginOtp${user._id}`, otp,
      {
        EX: 120,
      } 
    )

    await redisClient.set(
      `ResendLoginOtp${user._id}`, "1",
      {
        EX: 60,
      } 
    )
    await sendOTPEmail(user.email, otp);
  

  return res.status(200).json({
    success: true,
    otpRequired: true,
    message: "OTP sent successfully",
    userId: user._id
  });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
 });

 router.post("/verify-login-otp", otpLimiter, async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if(!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please enter UserId and OTP "
      })
    }
    const user = await User.findById(userId)
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    const storedOtp = await redisClient.get(`LoginOtp${userId}`);

    if(!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "Please enter otp"
      })
    }
    if(storedOtp !== otp.toString()){
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      })
    }
    await redisClient.del(`LoginOtp${userId}`);
    await redisClient.del(`ResendLoginOtp${userId}`);

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
  return res.status(200).json({
    success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
  })
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
  

 })

 router.post("/resend-login-otp", otpLimiter, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check cooldown
    const cooldown = await redisClient.get(
      `ResendLoginOtp${userId}`
    );

    if (cooldown) {
      const ttl = await redisClient.ttl(
        `ResendLoginOtp${userId}`
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${ttl} seconds before requesting another OTP`,
        retryAfter: ttl
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Store new OTP
    await redisClient.set(
      `LoginOtp${userId}`,
      otp,
      {
        EX: 120
      }
    );

    // Start new cooldown
    await redisClient.set(
      `ResendLoginOtp${userId}`,
      "1",
      {
        EX: 60
      }
    );

    // Send email
    await sendOTPEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
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
    const authHeader = req.headers.authorization;
    if(!authHeader) {
      return res.status(500).json({
        success: false,
        message: "Authorization token required"
      })
    }
    if(authHeader || authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1]
      
      try {
        const decode = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
        const currentTime = Math.floor(Date.now() / 1000)
        const remainingTime = decode.exp - currentTime;

        if(remainingTime > 0) {
          const tokenHash = crypto.createHash("sha256").update(accessToken).digest("hex")

          await redisClient.set(`BlackListAccessToken:${tokenHash}`, "1",
            {
              EX: remainingTime,
            }
          );
        }
      } catch (error) {
        console.log("Access token verification failed:",error.message)
      }
    }
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
      user: {
        user: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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
    }).select("-description").sort({ createdAt: -1 })
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
    res.status(500).json({
      success: false,
      message: "Failed to get lodge "
    });
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