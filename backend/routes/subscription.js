import { randomUUID } from "crypto";
import express from "express";
import { adminAuth, adminDb } from "../config/firebase.js";

const router = express.Router();

/**
 * ===========================================
 * FIREBASE AUTHENTICATION
 * ===========================================
 */

const verifyFirebaseUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const idToken = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error(
      "Firebase authentication failed:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication.",
    });
  }
};

/**
 * ===========================================
 * ZURI SUBSCRIPTION PLANS
 * ===========================================
 *
 * PRO
 * - Weekly: ₦2,000
 * - Monthly: ₦8,500
 * - Yearly: ₦120,000
 *
 * ULTRA
 * - Monthly: ₦10,000
 * - Yearly: ₦130,000
 *
 * Prices are controlled ONLY by backend.
 * ===========================================
 */

const SUBSCRIPTION_PLANS = {
  weekly: {
    name: "Zuri Pro Weekly",
    tier: "pro",
    subscriptionType: "weekly",
    amount: 2000,
    currency: "NGN",
    durationDays: 7,
  },

  monthly: {
    name: "Zuri Pro Monthly",
    tier: "pro",
    subscriptionType: "monthly",
    amount: 8500,
    currency: "NGN",
    durationDays: 30,
  },

  yearly: {
    name: "Zuri Pro Yearly",
    tier: "pro",
    subscriptionType: "yearly",
    amount: 120000,
    currency: "NGN",
    durationDays: 365,
  },

  "ultra-monthly": {
    name: "Zuri Ultra Monthly",
    tier: "ultra",
    subscriptionType: "ultra-monthly",
    amount: 10000,
    currency: "NGN",
    durationDays: 30,
  },

  "ultra-yearly": {
    name: "Zuri Ultra Yearly",
    tier: "ultra",
    subscriptionType: "ultra-yearly",
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
  return res.json({
    success: true,
    plans: SUBSCRIPTION_PLANS,
  });
});

/**
 * ===========================================
 * CREATE FLUTTERWAVE CHECKOUT
 *
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

      /**
       * =====================================
       * USER
       * =====================================
       */

      const userId = req.user.uid;

      console.log(
        "===================================="
      );

      console.log(
        "🔥 CREATE FLUTTERWAVE CHECKOUT"
      );

      console.log({
        userId,
        email,
        plan,
      });

      /**
       * =====================================
       * VALIDATE PLAN
       * =====================================
       */

      const selectedPlan =
        SUBSCRIPTION_PLANS[plan];

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription plan.",
        });
      }

      /**
       * =====================================
       * VALIDATE CUSTOMER EMAIL
       * =====================================
       */

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Customer email is required.",
        });
      }

      /**
       * =====================================
       * VERIFY FIREBASE USER
       * =====================================
       */

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

      /**
       * =====================================
       * CHECK FLUTTERWAVE SECRET KEY
       * =====================================
       */

      const flutterwaveSecret =
        process.env.FLW_SECRET_KEY;

      console.log(
        "🔐 FLUTTERWAVE KEY CHECK:",
        {
          exists:
            !!flutterwaveSecret,

          length:
            flutterwaveSecret?.length || 0,
        }
      );

      if (!flutterwaveSecret) {
        console.error(
          "❌ FLW_SECRET_KEY is missing."
        );

        return res.status(500).json({
          success: false,
          message:
            "Flutterwave payment configuration is missing.",
        });
      }

      /**
       * =====================================
       * UNIQUE TRANSACTION REFERENCE
       * =====================================
       */

      const txRef =
        `ZURI-${plan}-${randomUUID()}`;

      console.log(
        "💳 Flutterwave TX REF:",
        txRef
      );

      /**
       * =====================================
       * CREATE FLUTTERWAVE PAYMENT
       * =====================================
       */

      let flutterwaveResponse;

      try {
        flutterwaveResponse =
          await fetch(
            "https://api.flutterwave.com/v3/payments",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${flutterwaveSecret}`,
              },

              body: JSON.stringify({
                tx_ref: txRef,

                amount:
                  selectedPlan.amount,

                currency:
                  selectedPlan.currency,

                redirect_url:
                  process.env
                    .FLW_REDIRECT_URL,

                customer: {
                  email,

                  name:
                    name ||
                    "Zuri User",
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
      } catch (networkError) {
        console.error(
          "❌ Flutterwave network error:",
          networkError
        );

        return res.status(502).json({
          success: false,
          message:
            "Unable to connect to Flutterwave.",
        });
      }

      /**
       * =====================================
       * READ RAW RESPONSE
       * =====================================
       */

      const responseText =
        await flutterwaveResponse.text();

      console.log(
        "🔥 FLUTTERWAVE HTTP STATUS:",
        flutterwaveResponse.status
      );

      console.log(
        "🔥 FLUTTERWAVE CONTENT-TYPE:",
        flutterwaveResponse.headers.get(
          "content-type"
        )
      );

      console.log(
        "🔥 FLUTTERWAVE RAW RESPONSE:",
        responseText
      );

      /**
       * =====================================
       * PARSE RESPONSE SAFELY
       * =====================================
       */

      let data;

      try {
        data =
          JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "❌ Flutterwave did not return JSON."
        );

        return res.status(502).json({
          success: false,

          message:
            "Flutterwave returned an invalid response.",

          status:
            flutterwaveResponse.status,
        });
      }

      /**
       * =====================================
       * FLUTTERWAVE ERROR
       * =====================================
       */

      if (!flutterwaveResponse.ok) {
        console.error(
          "❌ Flutterwave checkout failed:",
          data
        );

        return res.status(
          flutterwaveResponse.status
        ).json({
          success: false,

          message:
            data?.message ||
            "Flutterwave checkout failed.",
        });
      }

      /**
       * =====================================
       * CHECK FLUTTERWAVE STATUS
       * =====================================
       */

      if (
        data?.status !==
        "success"
      ) {
        console.error(
          "❌ Flutterwave returned unsuccessful status:",
          data
        );

        return res.status(502).json({
          success: false,

          message:
            data?.message ||
            "Flutterwave could not create checkout.",
        });
      }

      /**
       * =====================================
       * GET HOSTED CHECKOUT LINK
       * =====================================
       */

      const checkoutUrl =
        data?.data?.link;

      console.log(
        "🔗 FLUTTERWAVE CHECKOUT URL:",
        checkoutUrl
      );

      if (!checkoutUrl) {
        console.error(
          "❌ No checkout URL returned by Flutterwave:",
          data
        );

        return res.status(502).json({
          success: false,

          message:
            "Flutterwave did not return a checkout link.",
        });
      }

      /**
       * =====================================
       * RETURN CHECKOUT TO FRONTEND
       * =====================================
       */

      const responsePayload = {
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
      };

      console.log(
        "===================================="
      );

      console.log(
        "✅ CHECKOUT READY FOR FRONTEND"
      );

      console.log({
        plan,
        amount:
          selectedPlan.amount,
        currency:
          selectedPlan.currency,
        checkoutUrl,
      });

      console.log(
        "===================================="
      );

      return res.json(
        responsePayload
      );
    } catch (error) {
      console.error(
        "❌ Flutterwave checkout error:",
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
 * ===========================================
 */

router.get(
  "/verify",
  async (req, res) => {
    try {
      const {
        transaction_id,
      } = req.query;

      /**
       * =====================================
       * VALIDATE TRANSACTION ID
       * =====================================
       */

      if (!transaction_id) {
        return res.status(400).json({
          success: false,

          message:
            "Transaction ID is required.",
        });
      }

      /**
       * =====================================
       * CHECK FLUTTERWAVE KEY
       * =====================================
       */

      const flutterwaveSecret =
        process.env.FLW_SECRET_KEY;

      if (!flutterwaveSecret) {
        console.error(
          "❌ FLW_SECRET_KEY is missing during verification."
        );

        return res.status(500).json({
          success: false,

          message:
            "Flutterwave payment configuration is missing.",
        });
      }

      console.log(
        "🔐 VERIFYING FLUTTERWAVE PAYMENT:",
        transaction_id
      );

      /**
       * =====================================
       * VERIFY DIRECTLY WITH FLUTTERWAVE
       * =====================================
       */

      const response =
        await fetch(
          `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
            transaction_id
          )}/verify`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${flutterwaveSecret}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      /**
       * =====================================
       * READ RESPONSE SAFELY
       * =====================================
       */

      const responseText =
        await response.text();

      console.log(
        "🔥 FLUTTERWAVE VERIFY STATUS:",
        response.status
      );

      console.log(
        "🔥 FLUTTERWAVE VERIFY RESPONSE:",
        responseText
      );

      let data;

      try {
        data =
          JSON.parse(responseText);
      } catch (error) {
        return res.status(502).json({
          success: false,

          message:
            "Flutterwave returned an invalid verification response.",

          status:
            response.status,
        });
      }

      /**
       * =====================================
       * FLUTTERWAVE VERIFICATION ERROR
       * =====================================
       */

      if (!response.ok) {
        return res.status(
          response.status
        ).json({
          success: false,

          message:
            data?.message ||
            "Unable to verify transaction.",
        });
      }

      console.log(
        "✅ Flutterwave verification:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      /**
       * =====================================
       * GET TRANSACTION
       * =====================================
       */

      const transaction =
        data?.data;

      /**
       * =====================================
       * PAYMENT MUST BE SUCCESSFUL
       * =====================================
       */

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

      /**
       * =====================================
       * PAYMENT METADATA
       * =====================================
       */

      const metadata =
        transaction.meta || {};

      const userId =
        metadata.userId;

      const plan =
        metadata.plan;

      if (
        !userId ||
        !plan
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Payment metadata is incomplete.",
        });
      }

      /**
       * =====================================
       * VALIDATE PLAN
       * =====================================
       */

      const selectedPlan =
        SUBSCRIPTION_PLANS[plan];

      if (!selectedPlan) {
        return res.status(400).json({
          success: false,

          message:
            "Unknown subscription plan.",
        });
      }

      /**
       * =====================================
       * VERIFY AMOUNT
       * =====================================
       */

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
          "❌ Payment amount mismatch:",
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

      /**
       * =====================================
       * VERIFY CURRENCY
       * =====================================
       */

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

      /**
       * =====================================
       * VERIFY FIREBASE USER
       * =====================================
       */

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

      /**
       * =====================================
       * FIRESTORE USER
       * =====================================
       */

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

      /**
       * =====================================
       * PREVENT PAYMENT REPLAY
       * =====================================
       */

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
              ?.subscriptionExpiresAt
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

      /**
       * =====================================
       * CALCULATE EXPIRATION
       * =====================================
       */

      const expiresAt =
        new Date();

      expiresAt.setDate(
        expiresAt.getDate() +
          selectedPlan.durationDays
      );

      /**
       * =====================================
       * ACTIVATE SUBSCRIPTION
       * =====================================
       */

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

      /**
       * =====================================
       * SUCCESS LOG
       * =====================================
       */

      console.log(
        "===================================="
      );

      console.log(
        "✅ ZURI SUBSCRIPTION ACTIVATED"
      );

      console.log({
        userId,

        email:
          firebaseUser.email ||
          transaction.customer?.email ||
          null,

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

      /**
       * =====================================
       * RETURN SUCCESS
       * =====================================
       */

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
        "❌ Payment verification error:",
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