import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const createPod = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }
    const { manager, retainerIds, podName } = data;
    if (!manager || !retainerIds || !podName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing manager, retainerIds, or podName."
      );
    }
    const podData = {
      manager,
      retainerIds,
      podName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    try {
      const podRef = await db.collection("pods").add(podData);
      functions.logger.info("Pod created with ID:", podRef.id);
      return { podId: podRef.id };
    } catch (error) {
      functions.logger.error("Error creating pod:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to create pod.",
        error
      );
    }
  }
);
