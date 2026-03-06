import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

function DriverDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "requests"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const acceptRequest = async (requestId) => {
    await updateDoc(doc(db, "requests", requestId), {
      status: "accepted",
      acceptedBy: auth.currentUser.uid,
      driverEmail: auth.currentUser.email
    });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
      <h2>Driver Dashboard</h2>
      <p style={{ color: "gray" }}>Logged in as: {auth.currentUser?.email}</p>
      <h3>Pending Requests</h3>

      {requests.length === 0 && (
        <p style={{ color: "gray", marginTop: "40px" }}>No pending requests right now.</p>
      )}

      {requests.map(req => (
        <div key={req.id} style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "15px",
          textAlign: "left"
        }}>
          <p><strong>Location:</strong> {req.location}</p>
          <p><strong>Train Number:</strong> {req.trainNumber}</p>
          <p><strong>Seats Needed:</strong> {req.seatsNeeded}</p>
          <p><strong>Passenger:</strong> {req.passengerEmail}</p>
          <button
            onClick={() => acceptRequest(req.id)}
            style={{
              padding: "10px 20px",
              background: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
              width: "100%",
              marginTop: "10px",
              fontSize: "15px"
            }}
          >
            Accept Request
          </button>
        </div>
      ))}
    </div>
  );
}

export default DriverDashboard;