import { useState } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
        <h2>✅ Request Sent!</h2>
        <p>A BOV driver will reach you at <strong>{location}</strong> shortly.</p>
        <button
          onClick={() => { setSubmitted(false); setLocation(""); setTrainNumber(""); }}
          style={{ padding: "10px 20px", background: "blue", color: "white", border: "none", cursor: "pointer", marginTop: "20px" }}
        >
          Make Another Request
        </button>
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