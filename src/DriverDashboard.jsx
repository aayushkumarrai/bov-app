import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function DriverDashboard() {
  const [requests, setRequests] = useState([]);
  const [acceptedRequest, setAcceptedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "requests"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "requests"),
      where("acceptedBy", "==", auth.currentUser.uid),
      where("status", "==", "accepted")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        setAcceptedRequest({ id: d.id, ...d.data() });
      } else {
        setAcceptedRequest(null);
      }
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

  const completeRequest = async () => {
    await updateDoc(doc(db, "requests", acceptedRequest.id), {
      status: "completed"
    });
    setAcceptedRequest(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (acceptedRequest) {
    return (
      <div style={{ maxWidth: "500px", margin: "100px auto", textAlign: "center" }}>
        <h2>🚗 On the way to passenger</h2>
        <div style={{ border: "1px solid green", borderRadius: "8px", padding: "15px", marginTop: "20px", textAlign: "left" }}>
          <p><strong>Passenger:</strong> {acceptedRequest.passengerEmail}</p>
          <p><strong>Location:</strong> {acceptedRequest.location}</p>
          <p><strong>Train Number:</strong> {acceptedRequest.trainNumber}</p>
          <p><strong>Seats Needed:</strong> {acceptedRequest.seatsNeeded}</p>
        </div>
        <button
          onClick={completeRequest}
          style={{ padding: "12px 40px", background: "blue", color: "white", border: "none", cursor: "pointer", fontSize: "16px", marginTop: "20px", width: "100%" }}
        >
          ✅ Mark as Completed
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "60px auto", textAlign: "center" }}>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={handleLogout}
          style={{ padding: "6px 14px", background: "red", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
        >
          Logout
        </button>
      </div>
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