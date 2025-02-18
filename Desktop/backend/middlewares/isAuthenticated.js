const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const isAuthenticated = asyncHandler(async (req, res, next) => {
  // Check if token is in cookies
  if (req.cookies.token) {
    try {
      // Verify token
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      // Get user from the token
      // console.log("decoded", decoded);
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = {
  isAuthenticated,
};
