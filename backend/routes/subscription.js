import express from "express";

const router = express.Router();

/**
 * ===========================================
 * ZURI PRO PLANS
 * ===========================================
 */

const PRO_PLANS = {
  weekly: {
    name: "Zuri Pro Weekly",
    amount: 5000,
    currency: "NGN",
    durationDays: 7,
  },

  monthly: {
    name: "Zuri Pro Monthly",
    amount: 20000,
    currency: "NGN",
    durationDays: 30,
  },

  yearly: {
    name: "Zuri Pro Yearly",
    amount: 130000,
    currency: "NGN",
    durationDays: 365,
  },
};

/**
 * ===========================================
 * GET ALL PLANS
 * GET /subscription/plans
 * ===========================================
 */

router.get("/plans", (req, res) => {
  res.json({
    success: true,
    plans: PRO_PLANS,
  });
});

/**
 * ===========================================
 * CREATE CHECKOUT
 * POST /subscription/create-checkout
 * ===========================================
 */

router.post(
  "/create-checkout",
  async (req, res) => {
    try {
      const { plan } = req.body;

      const selectedPlan =
        PRO_PLANS[plan];

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription plan.",
        });
      }

      return res.json({
        success: true,
        paymentReady: false,

        plan,

        name: selectedPlan.name,

        amount: selectedPlan.amount,

        currency:
          selectedPlan.currency,

        durationDays:
          selectedPlan.durationDays,

        message:
          "Flutterwave integration will be connected here.",
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create checkout.",
      });

    }
  }
);

export default router;