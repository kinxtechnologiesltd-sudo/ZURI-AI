import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";

export type UserPlan =
  | "free"
  | "pro"
  | "ultra";

export type SubscriptionType =
  | "weekly"
  | "monthly"
  | "yearly"
  | "ultra-monthly"
  | "ultra-yearly"
  | null;

export default function useUserPlan() {
  const [plan, setPlan] =
    useState<UserPlan>("free");

  const [subscriptionType, setSubscriptionType] =
    useState<SubscriptionType>(null);

  const [subscriptionExpiresAt, setSubscriptionExpiresAt] =
    useState<Date | null>(null);

  const [planLoading, setPlanLoading] =
    useState(true);

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | null = null;

    const unsubscribeAuth =
      onAuthStateChanged(auth, (user) => {
        // Stop listening to the previous account
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        // No logged-in user
        if (!user) {
          setPlan("free");
          setSubscriptionType(null);
          setSubscriptionExpiresAt(null);
          setPlanLoading(false);
          return;
        }

        setPlanLoading(true);

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        unsubscribeProfile = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              setPlan("free");
              setSubscriptionType(null);
              setSubscriptionExpiresAt(null);
              setPlanLoading(false);
              return;
            }

            const data = snapshot.data();

            // =========================================
            // READ USER PLAN
            // =========================================

            const storedPlan: UserPlan =
              data.plan === "ultra"
                ? "ultra"
                : data.plan === "pro"
                ? "pro"
                : "free";

            // =========================================
            // READ SUBSCRIPTION TYPE
            // =========================================

            const storedSubscriptionType:
              SubscriptionType =
              data.subscriptionType === "weekly" ||
              data.subscriptionType === "monthly" ||
              data.subscriptionType === "yearly" ||
              data.subscriptionType === "ultra-monthly" ||
              data.subscriptionType === "ultra-yearly"
                ? data.subscriptionType
                : null;

            // =========================================
            // READ EXPIRY DATE
            // =========================================

            let expiryDate: Date | null = null;

            if (
              data.subscriptionExpiresAt instanceof
              Timestamp
            ) {
              expiryDate =
                data.subscriptionExpiresAt.toDate();
            }

            // =========================================
            // CHECK WHETHER SUBSCRIPTION IS ACTIVE
            // =========================================

            if (
              storedPlan === "pro" ||
              storedPlan === "ultra"
            ) {
              if (expiryDate) {
                const subscriptionIsActive =
                  expiryDate.getTime() >
                  Date.now();

                setPlan(
                  subscriptionIsActive
                    ? storedPlan
                    : "free"
                );
              } else {
                // Development/manual access
                setPlan(storedPlan);
              }
            } else {
              setPlan("free");
            }

            setSubscriptionType(
              storedSubscriptionType
            );

            setSubscriptionExpiresAt(
              expiryDate
            );

            setPlanLoading(false);
          },
          (error) => {
            console.error(
              "Error loading Zuri subscription:",
              error
            );

            setPlan("free");
            setSubscriptionType(null);
            setSubscriptionExpiresAt(null);
            setPlanLoading(false);
          }
        );
      });

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // =========================================
  // RETURN SUBSCRIPTION STATUS
  // =========================================

  return {
    plan,

    // Pro features are also available to Ultra
    isProUser:
      plan === "pro" ||
      plan === "ultra",

    // Specifically identifies Ultra
    isUltraUser:
      plan === "ultra",

    subscriptionType,

    subscriptionExpiresAt,

    planLoading,
  };
}