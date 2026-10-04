const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 *  1000,// 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many register attempts. Please try again after 15 minutes."
  }
   
});

module.exports = registerLimiter