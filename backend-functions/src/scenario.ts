import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const simulateScenario = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const { currentRetainers, newRetainers, costPerRetainer, revenuePerRetainer } = data;
    if (currentRetainers == null || newRetainers == null || costPerRetainer == null || revenuePerRetainer == null) {
      throw new functions.https.HttpsError("invalid-argument", "Missing simulation parameters.");
    }
    const totalRetainers = currentRetainers + newRetainers;
    const totalRevenue = totalRetainers * revenuePerRetainer;
    const totalCost = totalRetainers * costPerRetainer;
    const totalProfit = totalRevenue - totalCost;
    functions.logger.info("Scenario simulated", { totalRetainers, totalRevenue, totalCost, totalProfit });
    return { totalRetainers, totalRevenue, totalCost, totalProfit };
  }
);
