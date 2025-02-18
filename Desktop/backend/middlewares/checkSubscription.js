const checkSubscription = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    // Check if the trial is active and hasn't expired
    if (user.isTrialActive && new Date() < user.trialEndDate) {
      return next();
    }
  
    // Check if the user's request count is within the limit for their subscription plan
    const requestLimit = user.subscriptionPlan === "premium" ? 20 : 5;
    if (user.apiRequestCount < requestLimit) {
      return next();
    }
  
    res
      .status(403)
      .json({ message: "API request limit reached or trial period expired" });
  });
  