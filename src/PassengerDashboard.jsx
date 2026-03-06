import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";

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

  if (activeRequest?.status === "pending") {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
        <h2>⏳ Waiting for a Driver...</h2>
        <p>Your request has been sent to all nearby BOV drivers.</p>
        <div style={{ border: "1px solid #444", borderRadius: "8px", padding: "15px", marginTop: "20px", textAlign: "left" }}>
          <p><strong>Location:</strong> {activeRequest.location}</p>
          <p><strong>Train Number:</strong> {activeRequest.trainNumber}</p>
          <p><strong>Seats Needed:</strong> {activeRequest.seatsNeeded}</p>
        </div>
      </div>
    );
  }

  if (activeRequest?.status === "accepted") {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
        <h2>🚗 Driver is on the way!</h2>
        <p>A BOV driver has accepted your request and is heading to you.</p>
        <div style={{ border: "1px solid green", borderRadius: "8px", padding: "15px", marginTop: "20px", textAlign: "left" }}>
          <p><strong>Your Location:</strong> {activeRequest.location}</p>
          <p><strong>Driver:</strong> {activeRequest.driverEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "center" }}>
      <h2>Book a BOV</h2>
      <p style={{ color: "gray" }}>Logged in as: {auth.currentUser?.email}</p>

      <label style={{ display: "block", textAlign: "left", marginBottom: "5px" }}>Your Location</label>
      <select
        value={location}
        onChange={e => setLocation(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "15px", padding: "8px" }}
      >
        <option value="">-- Select your location --</option>
        {LOCATIONS.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      <label style={{ display: "block", textAlign: "left", marginBottom: "5px" }}>Train Number</label>
      <input
        type="text"
        placeholder="e.g. 16590"
        value={trainNumber}
        onChange={e => setTrainNumber(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "15px", padding: "8px" }}
      />

      <label style={{ display: "block", textAlign: "left", marginBottom: "5px" }}>Seats Needed</label>
      <select
        value={seats}
        onChange={e => setSeats(Number(e.target.value))}
        style={{ display: "block", width: "100%", marginBottom: "15px", padding: "8px" }}
      >
        {[1,2,3,4,5].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleRequest}
        style={{ padding: "12px 40px", background: "green", color: "white", border: "none", cursor: "pointer", fontSize: "16px" }}
      >
        Request BOV
      </button>
    </div>
  );
}

export default PassengerDashboard;