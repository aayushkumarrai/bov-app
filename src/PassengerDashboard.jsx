import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LOCATIONS = [
  "Main Entrance / Gate 1",
  "Platform 1 - North End",
  "Platform 1 - South End",
  "Platform 2 - North End",
  "Platform 2 - South End",
  "Platform 3 - North End",
  "Platform 3 - South End",
  "Platform 4 - North End",
  "Platform 4 - South End",
  "Foot Over Bridge - Center",
  "Waiting Hall",
  "Retiring Room",
  "Ticket Counter"
];

function PassengerDashboard() {
  const [location, setLocation] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "requests"),
      where("passengerId", "==", auth.currentUser.uid),
      where("status", "in", ["pending", "accepted"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setActiveRequest({ id: doc.id, ...doc.data() });
      } else {
        setActiveRequest(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async () => {
    if (!location || !trainNumber) {
      setError("Please fill all fields.");
      return;
    }
    try {
      await addDoc(collection(db, "requests"), {
        passengerId: auth.currentUser.uid,
        passengerEmail: auth.currentUser.email,
        location: location,
        trainNumber: trainNumber,
        seatsNeeded: seats,
        status: "pending",
        timestamp: serverTimestamp()
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const headerBar = (
    <div style={{
      background: "#003580",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <p style={{ color: "#ffffff", fontWeight: "700", fontSize: "16px", margin: 0 }}>🚆 Where is my BOV?</p>
        <p style={{ color: "#90b4e8", fontSize: "12px", margin: 0 }}>Hubballi Railway Station</p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          background: "transparent",
          color: "#90b4e8",
          border: "1px solid #90b4e8",
          borderRadius: "6px",
          fontSize: "13px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );

  if (activeRequest?.status === "pending") {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
        {headerBar}
        <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>⏳</div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Waiting for a Driver</h2>
          <p style={{ color: "#546e7a", marginBottom: "24px" }}>
            Your request has been sent to all available BOV drivers nearby.
          </p>
          <div style={{
            background: "#ffffff",
            border: "1px solid #b0bec5",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left"
          }}>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>📍 Location: </span>
              <strong>{activeRequest.location}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>🚂 Train: </span>
              <strong>{activeRequest.trainNumber}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>💺 Seats: </span>
              <strong>{activeRequest.seatsNeeded}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeRequest?.status === "accepted") {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
        {headerBar}
        <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚗</div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "#2e7d32" }}>Driver is on the way!</h2>
          <p style={{ color: "#546e7a", marginBottom: "24px" }}>
            A BOV driver has accepted your request and is heading to your location.
          </p>
          <div style={{
            background: "#ffffff",
            border: "2px solid #2e7d32",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left"
          }}>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>📍 Your Location: </span>
              <strong>{activeRequest.location}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>🚗 Driver: </span>
              <strong>{activeRequest.driverEmail}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {headerBar}
      <div style={{ maxWidth: "480px", margin: "40px auto", padding: "0 20px" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            background: "#e8eef7",
            padding: "16px 24px",
            borderBottom: "1px solid #b0bec5"
          }}>
            <h2 style={{ fontSize: "20px", margin: 0 }}>Request a BOV</h2>
            <p style={{ color: "#546e7a", fontSize: "13px", margin: "4px 0 0" }}>
              {auth.currentUser?.email}
            </p>
          </div>

          <div style={{ padding: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              YOUR CURRENT LOCATION
            </label>
            <select value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">-- Select your location --</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              TRAIN NUMBER
            </label>
            <input
              type="text"
              placeholder="e.g. 16590"
              value={trainNumber}
              onChange={e => setTrainNumber(e.target.value)}
            />

            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              SEATS NEEDED
            </label>
            <select value={seats} onChange={e => setSeats(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? "seat" : "seats"}</option>
              ))}
            </select>

            {error && (
              <div style={{
                background: "#fff3f3",
                border: "1px solid #ffcdd2",
                borderRadius: "6px",
                padding: "10px 14px",
                marginBottom: "14px",
                color: "#c62828",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleRequest}
              style={{
                width: "100%",
                padding: "16px",
                background: "#003580",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "17px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Request BOV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerDashboard;