import { onAuthStateChanged } from "firebase/auth";
import {
    doc,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";

export type UserPlan = "free" | "pro";

export type SubscriptionType =
  | "weekly"
  | "monthly"
  | "yearly"
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

            const storedPlan =
              data.plan === "pro"
                ? "pro"
                : "free";

            const storedSubscriptionType:
              SubscriptionType =
              data.subscriptionType === "weekly" ||
              data.subscriptionType === "monthly" ||
              data.subscriptionType === "yearly"
                ? data.subscriptionType
                : null;

            let expiryDate: Date | null = null;

            if (
              data.subscriptionExpiresAt instanceof
              Timestamp
            ) {
              expiryDate =
                data.subscriptionExpiresAt.toDate();
            }

            /*
              DEVELOPMENT SUPPORT

              Your current test account only has:

              plan: "pro"

              So while no expiry date exists,
              it will continue working as Pro.

              Later, real paid subscriptions will
              have an expiry date.
            */

            if (storedPlan === "pro") {
              if (expiryDate) {
                const subscriptionIsActive =
                  expiryDate.getTime() >
                  Date.now();

                setPlan(
                  subscriptionIsActive
                    ? "pro"
                    : "free"
                );
              } else {
                // Manual development Pro access
                setPlan("pro");
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

  return {
    plan,

    isProUser: plan === "pro",

    subscriptionType,

    subscriptionExpiresAt,

    planLoading,
  };
}