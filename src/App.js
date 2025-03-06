import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { ThemeProvider, Box, Typography, Button, AppBar, Tabs, Tab } from '@mui/material';
import theme from './theme';
import DataVisualization from './DataVisualization';

// Firebase configuration – replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAaknlvrsDErmKQwlpDQc5deneeFv4w4LE",
  authDomain: "hrmny-cms.firebaseapp.com",
  projectId: "hrmny-cms",
  storageBucket: "hrmny-cms.firebasestorage.app",
  messagingSenderId: "Y196598200971",
  appId: "1:196598200971:web:6737ccb989da769d02f28e"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'us-central1');
const db = getFirestore(app);
const auth = getAuth(app);

// Helper component for Tab Panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [retainers, setRetainers] = useState([]);
  const [createResponse, setCreateResponse] = useState(null);
  const [simulateResponse, setSimulateResponse] = useState(null);

  // Monitor auth state changes
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

  // Sign in using Google
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Sign in successful:", result.user);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  // Sign out the current user
  const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fetch retainer documents from Firestore
  const fetchRetainers = async () => {
    try {
      const retainerCollection = collection(db, "retainers");
      const snapshot = await getDocs(retainerCollection);
      const retainerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRetainers(retainerList);
    } catch (error) {
      console.error("Error fetching retainers:", error);
    }
  };

  // Call createRetainer Cloud Function (ensuring auth is present)
  const callCreateRetainer = async () => {
    if (!auth.currentUser) {
      await signIn();
      if (!auth.currentUser) {
        console.error("User is still not signed in.");
        return;
      }
    }
    try {
      const createRetainer = httpsCallable(functions, 'createRetainer');
      const result = await createRetainer({
        clientName: "Example Corp",
        monthlyFee: 5000,
        scope: ["Design", "Development"]
      });
      console.log("Retainer created:", result.data);
      setCreateResponse(result.data);
      fetchRetainers();
    } catch (error) {
      console.error("Error calling createRetainer:", error);
    }
  };

  // Call simulateScenario Cloud Function (ensuring auth is present)
  const callSimulateScenario = async () => {
    if (!auth.currentUser) {
      await signIn();
      // Wait briefly to let auth state update
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!auth.currentUser) {
        console.error("User is still not signed in.");
        return;
      }
    }
    try {
      const simulateScenario = httpsCallable(functions, 'simulateScenario');
      const result = await simulateScenario({
        currentRetainers: 10,
        newRetainers: 5,
        costPerRetainer: 1000,
        revenuePerRetainer: 1500
      });
      console.log("Scenario result:", result.data);
      setSimulateResponse(result.data);
    } catch (error) {
      console.error("Error calling simulateScenario:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: '20px' }}>
        <AppBar position="static">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" />
            <Tab label="Retainers" />
            <Tab label="Modules" />
            <Tab label="Analytics" />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h4" component="h1">
            Agency Dashboard
          </Typography>
          {auth.currentUser ? (
            <div>
              <Typography variant="body1">
                Welcome, {user.displayName} ({user.email})!
              </Typography>
              <Button variant="contained" onClick={signOutUser} sx={{ mt: 2 }}>
                Sign Out
              </Button>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Use the buttons below to interact with the system:
                </Typography>
                <Button variant="contained" onClick={callCreateRetainer} sx={{ mt: 2 }}>
                  Create Retainer
                </Button>
                <Button variant="contained" onClick={callSimulateScenario} sx={{ mt: 2, ml: 2 }}>
                  Simulate Scenario
                </Button>
              </Box>
              {createResponse && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc' }}>
                  <Typography variant="h6">Create Retainer Response:</Typography>
                  <pre>{JSON.stringify(createResponse, null, 2)}</pre>
                </Box>
              )}
              {simulateResponse && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc' }}>
                  <Typography variant="h6">Scenario Response:</Typography>
                  <pre>{JSON.stringify(simulateResponse, null, 2)}</pre>
                </Box>
              )}
            </div>
          ) : (
            <Button variant="contained" onClick={signIn}>
              Sign In with Google
            </Button>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h5" component="h2">Retainers</Typography>
          {retainers.length === 0 ? (
            <Typography>No retainers found.</Typography>
          ) : (
            <ul>
              {retainers.map(retainer => (
                <li key={retainer.id}>
                  {retainer.clientName} - Monthly Fee: {retainer.monthlyFee}
                </li>
              ))}
            </ul>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Typography variant="h5" component="h2">Modules</Typography>
          <Typography variant="body1">
            Module integration coming soon.
          </Typography>
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <Typography variant="h5" component="h2">Analytics</Typography>
          <DataVisualization />
        </TabPanel>
      </div>
    </ThemeProvider>
  );
}

export default App;
// Import AdvancedAnalytics component at the top with your other imports:
import AdvancedAnalytics from './AdvancedAnalytics';

// In the Tabs component (inside AppBar), add:
<Tab label="Advanced Analytics" />

// Then, add a new TabPanel for it (e.g., after the Analytics tab):
<TabPanel value={tabIndex} index={4}>
  <Typography variant="h5" component="h2">Advanced Analytics</Typography>
  <AdvancedAnalytics />
</TabPanel>
