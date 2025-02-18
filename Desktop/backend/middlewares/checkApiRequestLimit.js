const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const checkApiRequestLimit = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Add a method in the User schema to check if trial is active
  const isTrialActive = user.isTrialActive();
  let requestLimit = 0;

  // Set request limits based on subscription plan and trial status
  if (isTrialActive) {
    requestLimit = 1000; // Example limit for trial period
  } else if (user.subscriptionPlan === "Free") {
    requestLimit = user?.monthlyRequestCount;
  } else if (user.subscriptionPlan === "Premium") {
    requestLimit = 100;
  } else if (user.subscriptionPlan === "Basic") {
    requestLimit = 50;
  }
  // Add additional conditions for other subscription plans if needed

  if (user.apiRequestCount >= requestLimit) {
    throw new Error("API request limit reached");
  }

  next(); // Continue to the next middleware or route handler
});

module.exports = checkApiRequestLimit;
