const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { redisClient } = require("../config/redis");

const authMidlleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        success: false,
        message: "Authentication required",
      })
    }
    

    const token = authHeader.split(" ")[1];

    const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    const blacklisted = await redisClient.exists(`BlackListAccessToken:${tokenHash}`);

    if(blacklisted) {
      return res.status(401).json({
        success: false,
        message: "Access token has been revoked .Please login again"
      });
    }
    req.user = decode;
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "invalid or expre token"
    })
  }
}

module.exports = authMidlleware;