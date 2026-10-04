const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 5 * 60 *  1000,// 5 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
   
});

const resendOtpLimit = rateLimit({
  windowMs: 5 * 60 *  1000,// 5 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  }
   
});

module.exports = {resendOtpLimit, otpLimiter}