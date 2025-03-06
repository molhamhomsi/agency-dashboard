import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const createRetainer = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }
    const { clientName, monthlyFee, scope, contractDetails } = data;
    if (!clientName || !monthlyFee || !scope) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: clientName, monthlyFee, or scope."
      );
    }
    const retainerData = {
      clientName,
      monthlyFee,
      scope,
      contractDetails: contractDetails || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    try {
      const docRef = await db.collection("retainers").add(retainerData);
      functions.logger.info("Retainer created with ID:", docRef.id);
      return { retainerId: docRef.id };
    } catch (error) {
      functions.logger.error("Error creating retainer:", error);
      throw new functions.https.HttpsError(
        "unknown",
        "Failed to create retainer.",
        error
      );
    }
  }
);
