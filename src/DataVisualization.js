import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Use your Firebase configuration
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

function DataVisualization() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const fetchChartData = async () => {
    try {
      const retainerCollection = collection(db, "retainers");
      const snapshot = await getDocs(retainerCollection);
      const labels = [];
      const fees = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        labels.push(data.clientName || "Unknown");
        fees.push(data.monthlyFee || 0);
      });
      setChartData({
        labels,
        datasets: [
          {
            label: 'Monthly Fee',
            data: fees,
            backgroundColor: 'rgba(25, 118, 210, 0.6)',
            borderColor: 'rgba(25, 118, 210, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Retainer Monthly Fees</h2>
      <Bar data={chartData} options={{ maintainAspectRatio: true }} />
    </div>
  );
}

export default DataVisualization;
