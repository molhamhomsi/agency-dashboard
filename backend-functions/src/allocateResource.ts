import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const allocateResource = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }
    const { retainerId, teamMembers, freelancers, budget, notes } = data;
    if (!retainerId || !budget) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing retainerId or budget."
      );
    }
    try {
      const allocation = {
        teamMembers: teamMembers || [],
        freelancers: freelancers || [],
        budget,
        notes: notes || "",
        allocationUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection("retainers").doc(retainerId).update({ allocation });
      functions.logger.info("Resources allocated for retainer:", retainerId);
      return { success: true };
    } catch (error) {
      functions.logger.error("Allocation error:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to allocate resources.",
        error
      );
    }
  }
);
