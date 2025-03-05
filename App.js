import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Replace these configuration values with your actual Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "us-central1");
const db = getFirestore(app);

function App() {
  const [createResponse, setCreateResponse] = useState(null);
  const [simulateResponse, setSimulateResponse] = useState(null);
  const [retainers, setRetainers] = useState([]);

  // Function to call createRetainer Cloud Function
  const callCreateRetainer = async () => {
    try {
      const createRetainer = httpsCallable(functions, "createRetainer");
      const result = await createRetainer({
        clientName: "Example Corp",
        monthlyFee: 5000,
        scope: ["Design", "Development"]
      });
      setCreateResponse(result.data);
      fetchRetainers();
    } catch (error) {
      console.error("Error calling createRetainer:", error);
    }
  };

  // Function to call simulateScenario Cloud Function
  const callSimulateScenario = async () => {
    try {
      const simulateScenario = httpsCallable(functions, "simulateScenario");
      const result = await simulateScenario({
        currentRetainers: 10,
        newRetainers: 5,
        costPerRetainer: 1000,
        revenuePerRetainer: 1500
      });
      setSimulateResponse(result.data);
    } catch (error) {
      console.error("Error calling simulateScenario:", error);
    }
  };

  // Function to fetch retainer documents from Firestore
  const fetchRetainers = async () => {
    try {
      const retainerCollection = collection(db, "retainers");
      const retainerSnapshot = await getDocs(retainerCollection);
      const retainerList = retainerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRetainers(retainerList);
    } catch (error) {
      console.error("Error fetching retainers:", error);
    }
  };

  useEffect(() => {
    fetchRetainers();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Agency Dashboard</h1>
      <button onClick={callCreateRetainer} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Create Retainer
      </button>
      {createResponse && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Create Retainer Response:</h2>
          <pre>{JSON.stringify(createResponse, null, 2)}</pre>
        </div>
      )}
      <button onClick={callSimulateScenario} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Simulate Scenario
      </button>
      {simulateResponse && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Scenario Simulation Response:</h2>
          <pre>{JSON.stringify(simulateResponse, null, 2)}</pre>
        </div>
      )}
      <h2 style={{ marginTop: '40px' }}>Retainers</h2>
      {retainers.length === 0 ? (
        <p>No retainers found.</p>
      ) : (
        <ul>
          {retainers.map(retainer => (
            <li key={retainer.id}>
              {retainer.clientName} - Monthly Fee: {retainer.monthlyFee}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
EOF