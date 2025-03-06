import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const trackTime = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }
    const { retainerId, taskId, taskName, timeSpent, category } = data;
    if (!retainerId || !taskId || !timeSpent) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: retainerId, taskId, or timeSpent."
      );
    }
    const timeLog = {
      retainerId,
      taskId,
      taskName: taskName || "Unnamed Task",
      timeSpent,
      category: category || "Uncategorized",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    try {
      await db.collection("time_logs").add(timeLog);
      functions.logger.info("Time logged for retainer:", retainerId);
      return { success: true };
    } catch (error) {
      functions.logger.error("Error logging time:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to record time.",
        error
      );
    }
  }
);
