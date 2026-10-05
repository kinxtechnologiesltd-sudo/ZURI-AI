import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../config/firebase.js";

const DAILY_IMAGE_LIMIT = 2;
const DAILY_LIMIT_MESSAGE =
  "You've reached your daily image generation limit of 2 images. Your limit will reset tomorrow.";

function readCount(value) {
  return Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
}

function getQuotaRef(userId, dateKey) {
  if (!userId) {
    throw new Error("userId is required.");
  }

  if (!dateKey) {
    throw new Error("dateKey is required.");
  }

  return adminDb
    .collection("imageGenerationQuota")
    .doc(`${userId}_${dateKey}`);
}

export async function reserveImageGeneration(userId) {
  if (!userId) {
    throw new Error("userId is required.");
  }

  const dateKey = new Date().toISOString().slice(0, 10);
  const quotaRef = getQuotaRef(userId, dateKey);
  const userRef = adminDb
    .collection("users")
    .doc(userId);

  return adminDb.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const userData = userSnapshot.data() || {};
    const userPlan = userData.plan;
    const subscriptionExpiresAt =
      userData.subscriptionExpiresAt?.toDate?.();
    const hasUnlimitedQuota =
      (userPlan === "pro" || userPlan === "ultra") &&
      (!subscriptionExpiresAt ||
        subscriptionExpiresAt.getTime() > Date.now());

    if (hasUnlimitedQuota) {
      return {
        dateKey,
        reservationCreated: false,
        quota: {
          used: 0,
          reserved: 0,
          userId,
          date: dateKey,
          unlimited: true,
          limit: null,
          remaining: null,
        },
      };
    }

    const snapshot = await transaction.get(quotaRef);
    const used = readCount(snapshot.get("used"));
    const reserved = readCount(snapshot.get("reserved"));

    if (used + reserved >= DAILY_IMAGE_LIMIT) {
      const error = new Error(DAILY_LIMIT_MESSAGE);
      error.code = "IMAGE_DAILY_LIMIT_REACHED";
      throw error;
    }

    const nextReserved = reserved + 1;

    transaction.set(quotaRef, {
      used,
      reserved: nextReserved,
      userId,
      date: dateKey,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      dateKey,
      reservationCreated: true,
      quota: {
        used,
        reserved: nextReserved,
        userId,
        date: dateKey,
        limit: DAILY_IMAGE_LIMIT,
        remaining: DAILY_IMAGE_LIMIT - used - nextReserved,
      },
    };
  });
}

export async function commitImageGeneration(userId, dateKey) {
  const quotaRef = getQuotaRef(userId, dateKey);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(quotaRef);
    const used = readCount(snapshot.get("used"));
    const reserved = readCount(snapshot.get("reserved"));

    transaction.set(quotaRef, {
      used: used + 1,
      reserved: Math.max(0, reserved - 1),
      userId,
      date: dateKey,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function releaseImageGeneration(userId, dateKey) {
  const quotaRef = getQuotaRef(userId, dateKey);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(quotaRef);
    const used = readCount(snapshot.get("used"));
    const reserved = readCount(snapshot.get("reserved"));

    transaction.set(quotaRef, {
      used,
      reserved: Math.max(0, reserved - 1),
      userId,
      date: dateKey,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}