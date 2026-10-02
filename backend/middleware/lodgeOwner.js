const ownerMiddleware = (req, res, next) => {
  if(req.user.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Access denied only Lodge/Hostel Owner can access"
    });
  }

  next();
}

module.exports = ownerMiddleware;