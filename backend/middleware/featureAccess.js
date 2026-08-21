import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();

/**
 * =====================================================
 * ZURI FEATURE ACCESS
 * =====================================================
 */

const FEATURE_PLANS = {
  imageGeneration: ["pro", "ultra"],
  videoGeneration: ["pro", "ultra"],
  voiceGeneration: ["pro", "ultra"],
  musicGeneration: ["pro", "ultra"],
  imageEditing: ["pro", "ultra"],
  videoEditing: ["pro", "ultra"],
};

/**
 * Normalize subscription plan.
 */
function normalizePlan(plan) {
  if (!plan) {
    return "free";
  }

  const value = String(plan)
    .trim()
    .toLowerCase();

  if (
    value === "ultra" ||
    value === "zuri ultra" ||
    value === "zuri_ultra"
  ) {
    return "ultra";
  }

  if (
    value === "pro" ||
    value === "zuri pro" ||
    value === "zuri_pro"
  ) {
    return "pro";
  }

  return "free";
}

/**
 * Check whether a subscription is active.
 */
function isSubscriptionActive(data) {
  if (!data) {
    return false;
  }

  if (
    data.active === true ||
    data.isActive === true
  ) {
    return true;
  }

  if (data.status) {
    const status =
      String(data.status)
        .trim()
        .toLowerCase();

    if (
      status === "active" ||
      status === "paid" ||
      status === "successful" ||
      status === "completed"
    ) {
      return true;
    }
  }

  const expiry =
    data.expiresAt ||
    data.expiryDate ||
    data.subscriptionEnd ||
    data.currentPeriodEnd;

  if (expiry) {
    const expiryDate =
      expiry?.toDate
        ? expiry.toDate()
        : new Date(expiry);

    if (
      !Number.isNaN(
        expiryDate.getTime()
      )
    ) {
      return (
        expiryDate.getTime() >
        Date.now()
      );
    }
  }

  return false;
}

/**
 * =====================================================
 * GET USER PLAN
 * =====================================================
 */
export async function getUserPlan(
  uid
) {
  if (!uid) {
    return {
      plan: "free",
      active: false,
      source: "no-user",
    };
  }

  /**
   * ==========================================
   * FIREBASE AUTH CUSTOM CLAIMS
   * ==========================================
   */

  try {
    const user =
      await getAuth().getUser(uid);

    const claims =
      user.customClaims || {};

    const claimPlan =
      normalizePlan(
        claims.plan ||
        claims.subscriptionPlan ||
        claims.zuriPlan
      );

    if (
      claimPlan !== "free" &&
      (
        claims.subscriptionActive === true ||
        claims.pro === true ||
        claims.ultra === true
      )
    ) {
      return {
        plan: claimPlan,
        active: true,
        source: "firebase-claims",
      };
    }
  } catch (error) {
    console.warn(
      "⚠️ Firebase claims lookup failed:",
      error.message
    );
  }

  /**
   * ==========================================
   * FIRESTORE SUBSCRIPTIONS
   * ==========================================
   */

  try {
    const subscriptionRef =
      db
        .collection("subscriptions")
        .doc(uid);

    const subscriptionSnap =
      await subscriptionRef.get();

    if (subscriptionSnap.exists) {
      const data =
        subscriptionSnap.data() || {};

      const plan =
        normalizePlan(
          data.plan ||
          data.subscriptionPlan ||
          data.zuriPlan
        );

      const active =
        isSubscriptionActive(data);

      if (
        active &&
        plan !== "free"
      ) {
        return {
          plan,
          active: true,
          source: "firestore-subscriptions",
        };
      }
    }
  } catch (error) {
    console.warn(
      "⚠️ Subscription lookup failed:",
      error.message
    );
  }

  /**
   * ==========================================
   * FIRESTORE USER DOCUMENT FALLBACK
   * ==========================================
   */

  try {
    const userRef =
      db
        .collection("users")
        .doc(uid);

    const userSnap =
      await userRef.get();

    if (userSnap.exists) {
      const data =
        userSnap.data() || {};

      const plan =
        normalizePlan(
          data.plan ||
          data.subscriptionPlan ||
          data.zuriPlan
        );

      const active =
        isSubscriptionActive(data);

      if (
        active &&
        plan !== "free"
      ) {
        return {
          plan,
          active: true,
          source: "firestore-users",
        };
      }
    }
  } catch (error) {
    console.warn(
      "⚠️ User subscription lookup failed:",
      error.message
    );
  }

  /**
   * ==========================================
   * DEFAULT = FREE
   * ==========================================
   */

  return {
    plan: "free",
    active: false,
    source: "default",
  };
}

/**
 * =====================================================
 * REQUIRE FEATURE
 * =====================================================
 */
export function requireFeature(
  feature
) {
  return async (
    req,
    res,
    next
  ) => {
    try {
      const uid =
        req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          code: "AUTH_REQUIRED",
          message:
            "Please sign in to use this feature.",
        });
      }

      const allowedPlans =
        FEATURE_PLANS[feature];

      if (!allowedPlans) {
        console.error(
          `❌ Unknown Zuri feature: ${feature}`
        );

        return res.status(500).json({
          success: false,
          code: "UNKNOWN_FEATURE",
          message:
            "This Zuri feature is not configured.",
        });
      }

      const subscription =
        await getUserPlan(uid);

      console.log(
        "🔐 ZURI FEATURE ACCESS:",
        {
          uid,
          feature,
          plan:
            subscription.plan,
          active:
            subscription.active,
          source:
            subscription.source,
        }
      );

      /**
       * ==========================================
       * ALLOW PRO / ULTRA
       * ==========================================
       */

      if (
        subscription.active &&
        allowedPlans.includes(
          subscription.plan
        )
      ) {
        req.zuriPlan =
          subscription.plan;

        req.zuriFeature =
          feature;

        return next();
      }

      /**
       * ==========================================
       * BLOCK FREE USERS
       * ==========================================
       */

      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        feature,
        currentPlan:
          subscription.plan,
        upgradeRequired: true,
        message:
          "This feature requires Zuri Pro or Zuri Ultra.",
      });

    } catch (error) {
      console.error(
        "❌ Zuri feature access error:",
        error
      );

      return res.status(500).json({
        success: false,
        code: "FEATURE_ACCESS_ERROR",
        message:
          "Unable to verify your Zuri subscription.",
      });
    }
  };
}

export {
    FEATURE_PLANS, isSubscriptionActive, normalizePlan
};
