const asyncHandler = require("express-async-handler");
// This is a webhook handler for Stripe payment success
const stripeWebhookHandler = asyncHandler(async (req, res) => {
  const event = req.body;

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object; // contains data about the payment
      const userId = paymentIntent.metadata.userId; // assuming you pass the user ID in metadata

      // Find the user and update their subscription status
      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: "premium", // Update to the appropriate plan
        monthlyRequestCount: 0, // Reset the request count
      });

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
      res.json({ received: true });
  }
});

module.exports = {
  stripeWebhookHandler,
};
