import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Login from "./Login";
import Signup from "./Signup";
import PassengerDashboard from "./PassengerDashboard";
import DriverDashboard from "./DriverDashboard";
import AdminDashboard from "./AdminDashboard";

const ADMIN_EMAIL = "admin@bov.com";

function ProtectedAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) return <p style={{ textAlign: "center", marginTop: "100px" }}>Loading...</p>;
  if (!allowed) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passenger" element={<PassengerDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/admin" element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;