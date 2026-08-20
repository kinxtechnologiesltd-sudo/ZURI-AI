import { randomUUID } from "crypto";
import express from "express";
import { adminAuth, adminDb } from "../config/firebase.js";

const router = express.Router();
const verifyFirebaseUser = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const idToken =
      authHeader.substring(7);

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error(
      "Firebase authentication failed:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication.",
    });
  }
};
/**
 * ===========================================
 * ZURI SUBSCRIPTION PLANS
 * ===========================================
 *
 * PRO
 * - Weekly
 * - Monthly
 * - Yearly
 *
 * ULTRA
 * - Monthly
 * - Yearly
 *
 * Prices are controlled by the backend.
 * Never trust prices sent from the frontend.
 * ===========================================
 */

const SUBSCRIPTION_PLANS = {
  // =========================================
  // ZURI PRO
  // =========================================

  weekly: {
    name: "Zuri Pro Weekly",
    tier: "pro",
    subscriptionType: "weekly",
    amount: 5000,
    currency: "NGN",
    durationDays: 7,
  },

  monthly: {
    name: "Zuri Pro Monthly",
    tier: "pro",
    subscriptionType: "monthly",
    amount: 20000,
    currency: "NGN",
    durationDays: 30,
  },

  yearly: {
    name: "Zuri Pro Yearly",
    tier: "pro",
    subscriptionType: "yearly",
    amount: 130000,
    currency: "NGN",
    durationDays: 365,
  },

  // =========================================
  // ZURI ULTRA
  // =========================================

  "ultra-monthly": {
    name: "Zuri Ultra Monthly",
    tier: "ultra",
    subscriptionType: "ultra-monthly",
    amount: 15000,
    currency: "NGN",
    durationDays: 30,
  },

  "ultra-yearly": {
    name: "Zuri Ultra Yearly",
    tier: "ultra",
    subscriptionType: "ultra-yearly",
    amount: 150000,
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
    plans: SUBSCRIPTION_PLANS,
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
  verifyFirebaseUser,
  async (req, res) => {
    try {
const {
  plan,
  email,
  name,
} = req.body;

const userId =
  req.user.uid;

      // =========================================
      // 1. VALIDATE PLAN
      // =========================================

      const selectedPlan =
        SUBSCRIPTION_PLANS[plan];

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid subscription plan.",
        });
      }

      // =========================================
      // 2. VALIDATE CUSTOMER
      // =========================================

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Customer email is required.",
        });
      }

     

      // =========================================
      // 3. VERIFY FIREBASE USER EXISTS
      // =========================================

      try {
        await adminAuth.getUser(userId);
      } catch (error) {
        console.error(
          "Firebase user verification failed:",
          error
        );

        return res.status(401).json({
          success: false,
          message:
            "Invalid Zuri user account.",
        });
      }

      // =========================================
      // 4. CREATE UNIQUE TRANSACTION REFERENCE
      // =========================================

      const txRef =
        `ZURI-${plan}-${randomUUID()}`;

      // =========================================
      // 5. CREATE FLUTTERWAVE PAYMENT
      // =========================================

      const flutterwaveResponse =
        await fetch(
          "https://api.flutterwave.com/v3/payments",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${process.env.FLW_SECRET_KEY}`,
            },

            body: JSON.stringify({
              tx_ref: txRef,

              amount:
                selectedPlan.amount,

              currency:
                selectedPlan.currency,

              redirect_url:
                process.env.FLW_REDIRECT_URL,

              customer: {
                email,

                name:
                  name || "Zuri User",
              },

              customizations: {
                title:
                  selectedPlan.name,

                description:
                  `Subscribe to ${selectedPlan.name}`,
              },

              meta: {
                userId,

                plan,

                tier:
                  selectedPlan.tier,

                subscriptionType:
                  selectedPlan.subscriptionType,

                durationDays:
                  selectedPlan.durationDays,
              },
            }),
          }
        );

      const data =
        await flutterwaveResponse.json();

      console.log(
        "Flutterwave response:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      // =========================================
      // 6. HANDLE FLUTTERWAVE ERROR
      // =========================================

      if (!flutterwaveResponse.ok) {
        return res.status(
          flutterwaveResponse.status
        ).json({
          success: false,

          message:
            data.message ||
            "Flutterwave checkout failed.",
        });
      }

      // =========================================
      // 7. GET CHECKOUT URL
      // =========================================

      const checkoutUrl =
        data.data?.link;

      if (!checkoutUrl) {
        console.error(
          "Flutterwave did not return checkout URL:",
          data
        );

        return res.status(502).json({
          success: false,

          message:
            "Flutterwave did not return a checkout link.",
        });
      }

      // =========================================
      // 8. RETURN CHECKOUT INFORMATION
      // =========================================

      return res.json({
        success: true,

        paymentReady: true,

        plan,

        tier:
          selectedPlan.tier,

        subscriptionType:
          selectedPlan.subscriptionType,

        name:
          selectedPlan.name,

        amount:
          selectedPlan.amount,

        currency:
          selectedPlan.currency,

        durationDays:
          selectedPlan.durationDays,

        txRef,

        checkoutUrl,

        message:
          "Flutterwave checkout created successfully.",
      });

    } catch (error) {
      console.error(
        "Flutterwave checkout error:",
        error
      );

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

/**
 * ===========================================
 * VERIFY FLUTTERWAVE PAYMENT
 *
 * GET /subscription/verify?transaction_id=123
 *
 * IMPORTANT:
 * This is the ONLY place where a successful
 * payment grants the subscription.
 * ===========================================
 */

router.get(
  "/verify",
  async (req, res) => {
    try {
      const {
        transaction_id,
      } = req.query;

      // =========================================
      // 1. VALIDATE TRANSACTION ID
      // =========================================

      if (!transaction_id) {
        return res.status(400).json({
          success: false,

          message:
            "Transaction ID is required.",
        });
      }

      // =========================================
      // 2. VERIFY DIRECTLY WITH FLUTTERWAVE
      // =========================================

      const response =
        await fetch(
          `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
            transaction_id
          )}/verify`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${process.env.FLW_SECRET_KEY}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      console.log(
        "Flutterwave verification:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      if (!response.ok) {
        return res.status(
          response.status
        ).json({
          success: false,

          message:
            data.message ||
            "Unable to verify transaction.",
        });
      }

      const transaction =
        data.data;

      // =========================================
      // 3. PAYMENT MUST BE SUCCESSFUL
      // =========================================

      if (
        !transaction ||
        transaction.status !==
          "successful"
      ) {
        return res.status(400).json({
          success: false,

          paid: false,

          message:
            "Payment was not successful.",
        });
      }

      // =========================================
      // 4. READ METADATA
      // =========================================

      const metadata =
        transaction.meta || {};

      const userId =
        metadata.userId;

      const plan =
        metadata.plan;

      // =========================================
      // 5. VALIDATE PLAN
      // =========================================

      if (!userId || !plan) {
        console.error(
          "Missing payment metadata:",
          metadata
        );

        return res.status(400).json({
          success: false,

          message:
            "Payment metadata is incomplete.",
        });
      }

      const selectedPlan =
        SUBSCRIPTION_PLANS[plan];

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,

          message:
            "Unknown subscription plan.",
        });
      }

      // =========================================
      // 6. VERIFY AMOUNT
      // =========================================

      const paidAmount =
        Number(
          transaction.amount
        );

      const expectedAmount =
        Number(
          selectedPlan.amount
        );

      if (
        paidAmount !==
        expectedAmount
      ) {
        console.error(
          "Payment amount mismatch:",
          {
            paidAmount,
            expectedAmount,
            plan,
          }
        );

        return res.status(400).json({
          success: false,

          paid: false,

          message:
            "Payment amount does not match the selected plan.",
        });
      }

      // =========================================
      // 7. VERIFY CURRENCY
      // =========================================

      if (
        transaction.currency !==
        selectedPlan.currency
      ) {
        return res.status(400).json({
          success: false,

          paid: false,

          message:
            "Payment currency does not match the selected plan.",
        });
      }

      // =========================================
      // 8. VERIFY CUSTOMER EMAIL AGAINST
      //    FIREBASE ACCOUNT
      // =========================================

      let firebaseUser;

      try {
        firebaseUser =
          await adminAuth.getUser(
            userId
          );
      } catch (error) {
        console.error(
          "Could not find Firebase user:",
          error
        );

        return res.status(404).json({
          success: false,

          message:
            "Zuri user account was not found.",
        });
      }

    
      // =========================================
      // 9. GET FIRESTORE USER DOCUMENT
      // =========================================

      const userRef =
        adminDb
          .collection("users")
          .doc(userId);

      const userSnapshot =
        await userRef.get();

      if (
        !userSnapshot.exists
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Zuri user profile was not found.",
        });
      }

      const existingUser =
        userSnapshot.data();

      // =========================================
      // 10. PREVENT REPLAYING THE SAME PAYMENT
      // =========================================

      const transactionId =
        String(
          transaction.id
        );

      const previousTransactionId =
        existingUser
          ?.lastFlutterwaveTransactionId;

      if (
        previousTransactionId ===
        transactionId
      ) {
        console.log(
          "ℹ️ Transaction already processed:",
          transactionId
        );

        return res.json({
          success: true,

          paid: true,

          alreadyProcessed: true,

          plan:
            existingUser.plan ||
            selectedPlan.tier,

          subscriptionType:
            existingUser.subscriptionType ||
            selectedPlan.subscriptionType,

          expiresAt:
            existingUser
              .subscriptionExpiresAt
              ?.toDate
              ? existingUser
                  .subscriptionExpiresAt
                  .toDate()
                  .toISOString()
              : null,

          message:
            "This payment has already been processed.",
        });
      }

      // =========================================
      // 11. CALCULATE NEW EXPIRATION DATE
      // =========================================

      const expiresAt =
        new Date();

      expiresAt.setDate(
        expiresAt.getDate() +
          selectedPlan.durationDays
      );

      // =========================================
      // 12. UPDATE FIREBASE
      // =========================================

      await userRef.update({
        plan:
          selectedPlan.tier,

        subscriptionType:
          selectedPlan.subscriptionType,

        subscriptionStatus:
          "active",

        subscriptionExpiresAt:
          expiresAt,

        lastPaymentReference:
          transaction.tx_ref,

        lastFlutterwaveTransactionId:
          transactionId,

        lastPaymentAmount:
          paidAmount,

        lastPaymentCurrency:
          transaction.currency,

        updatedAt:
          new Date(),
      });

      // =========================================
      // 13. LOG SUCCESS
      // =========================================

      console.log(
        "===================================="
      );

      console.log(
        "✅ ZURI SUBSCRIPTION ACTIVATED"
      );

      console.log({
        userId,
     email: transaction.customer?.email || null,
        plan:
          selectedPlan.tier,
        subscriptionType:
          selectedPlan.subscriptionType,
        amount:
          paidAmount,
        currency:
          transaction.currency,
        expiresAt:
          expiresAt.toISOString(),
        transactionId,
        txRef:
          transaction.tx_ref,
      });

      console.log(
        "===================================="
      );

      // =========================================
      // 14. RETURN SUCCESS
      // =========================================

      return res.json({
        success: true,

        paid: true,

        alreadyProcessed: false,

        plan:
          selectedPlan.tier,

        subscriptionType:
          selectedPlan.subscriptionType,

        expiresAt:
          expiresAt.toISOString(),

        message:
          `Zuri ${selectedPlan.tier.toUpperCase()} activated successfully.`,
      });

    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      });
    }
  }
);

export default router;