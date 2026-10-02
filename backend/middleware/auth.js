const jwt = require("jsonwebtoken");

const authMidlleware = (req, res, next) => {
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