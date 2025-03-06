import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const updateFinance = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }
    const { retainerId, month, revenue, cost } = data;
    if (!retainerId || !month || revenue == null || cost == null) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required financial data."
      );
    }
    const financeData = {
      retainerId,
      month,
      revenue,
      cost,
      profit: revenue - cost,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection("finance")
        .doc(`${retainerId}_${month}`)
        .set(financeData);
      functions.logger.info("Finance updated for retainer:", retainerId);
      return { success: true };
    } catch (error) {
      functions.logger.error("Error updating finance:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to update finance.",
        error
      );
    }
  }
);
