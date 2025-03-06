import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaknlvrsDErmKQwlpDQc5deneeFv4w4LE",
  authDomain: "hrmny-cms.firebaseapp.com",
  projectId: "hrmny-cms",
  storageBucket: "hrmny-cms.firebasestorage.app",
  messagingSenderId: "Y196598200971",
  appId: "1:196598200971:web:6737ccb989da769d02f28e"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, "us-central1");
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [createResponse, setCreateResponse] = useState(null);
  const [simulateResponse, setSimulateResponse] = useState(null);
  const [allocationResponse, setAllocationResponse] = useState(null);
  const [financeResponse, setFinanceResponse] = useState(null);
  const [podResponse, setPodResponse] = useState(null);
  const [timeResponse, setTimeResponse] = useState(null);
  const [retainers, setRetainers] = useState([]);
  const [user, setUser] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchRetainers();
      } else {
        setRetainers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Call createRetainer Cloud Function
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

  // Call simulateScenario Cloud Function
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

  // Call allocateResource Cloud Function
  const callAllocateResource = async () => {
    try {
      const allocateResource = httpsCallable(functions, "allocateResource");
      const result = await allocateResource({
        retainerId: "testRetainerId",
        teamMembers: ["Alice", "Bob"],
        freelancers: ["Charlie"],
        budget: 1500,
        notes: "Initial allocation"
      });
      setAllocationResponse(result.data);
    } catch (error) {
      console.error("Error calling allocateResource:", error);
    }
  };

  // Call updateFinance Cloud Function
  const callUpdateFinance = async () => {
    try {
      const updateFinance = httpsCallable(functions, "updateFinance");
      const result = await updateFinance({
        retainerId: "testRetainerId",
        month: "2025-03",
        revenue: 10000,
        cost: 7000
      });
      setFinanceResponse(result.data);
    } catch (error) {
      console.error("Error calling updateFinance:", error);
    }
  };

  // Call createPod Cloud Function
  const callCreatePod = async () => {
    try {
      const createPod = httpsCallable(functions, "createPod");
      const result = await createPod({
        manager: "Manager1",
        retainerIds: ["retainerId1", "retainerId2"],
        podName: "Pod Alpha"
      });
      setPodResponse(result.data);
    } catch (error) {
      console.error("Error calling createPod:", error);
    }
  };

  // Call trackTime Cloud Function
  const callTrackTime = async () => {
    try {
      const trackTime = httpsCallable(functions, "trackTime");
      const result = await trackTime({
        retainerId: "testRetainerId",
        taskId: "task001",
        taskName: "Design Meeting",
        timeSpent: 60,
        category: "Meeting"
      });
      setTimeResponse(result.data);
    } catch (error) {
      console.error("Error calling trackTime:", error);
    }
  };

  // Fetch retainer documents from Firestore
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Agency Dashboard</h1>
      {!user ? (
        <button onClick={signIn} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Sign In with Google
        </button>
      ) : (
        <div>
          <p>Signed in as {user.displayName} ({user.email})</p>
          <button onClick={signOutUser} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Sign Out
          </button>
        </div>
      )}
      {user && (
        <>
          <button onClick={callCreateRetainer} style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}>
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
          <button onClick={callAllocateResource} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Allocate Resource
          </button>
          {allocationResponse && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
              <h2>Resource Allocation Response:</h2>
              <pre>{JSON.stringify(allocationResponse, null, 2)}</pre>
            </div>
          )}
          <button onClick={callUpdateFinance} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Update Finance
          </button>
          {financeResponse && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
              <h2>Finance Update Response:</h2>
              <pre>{JSON.stringify(financeResponse, null, 2)}</pre>
            </div>
          )}
          <button onClick={callCreatePod} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Create Pod
          </button>
          {podResponse && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
              <h2>Create Pod Response:</h2>
              <pre>{JSON.stringify(podResponse, null, 2)}</pre>
            </div>
          )}
          <button onClick={callTrackTime} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Track Time
          </button>
          {timeResponse && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
              <h2>Time Tracking Response:</h2>
              <pre>{JSON.stringify(timeResponse, null, 2)}</pre>
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
        </>
      )}
    </div>
  );
}

export default App;
