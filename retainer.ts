import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const createRetainer = functions.https.onCall(async (data, context) => {
  // Security check: ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  const { clientName, monthlyFee, scope } = data;
  try {
    const retainerRef = await db.collection("retainers").add({
      clientName,
      monthlyFee,
      scope,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { retainerId: retainerRef.id };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", "Failed to create retainer", error);
  }
});
