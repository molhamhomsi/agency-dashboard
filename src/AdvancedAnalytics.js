import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration (use the same config as your App.js)
const firebaseConfig = {
  apiKey: "AIzaSyAaknlvrsDErmKQwlpDQc5deneeFv4w4LE",
  authDomain: "hrmny-cms.firebaseapp.com",
  projectId: "hrmny-cms",
  storageBucket: "hrmny-cms.firebasestorage.app",
  messagingSenderId: "Y196598200971",
  appId: "1:196598200971:web:6737ccb989da769d02f28e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function AdvancedAnalytics() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchAnalyticsData = async () => {
    try {
      const financeCollection = collection(db, "finance");
      const snapshot = await getDocs(financeCollection);
      const labels = [];
      const revenues = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Assume data.month exists (e.g., "Jan", "Feb", etc.)
        labels.push(data.month);
        revenues.push(data.revenue);
      });
      setChartData({
        labels,
        datasets: [
          {
            label: 'Revenue Trend',
            data: revenues,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Revenue Trend</h2>
      <Line data={chartData} options={{ maintainAspectRatio: true }} />
    </div>
  );
}

export default AdvancedAnalytics;
