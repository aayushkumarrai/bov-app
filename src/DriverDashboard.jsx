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

  const ticketLabel = (type, value) => {
    if (type === "pnr") return `PNR: ${value}`;
    if (type === "train") return `Train: ${value}`;
    if (type === "uts") return "UTS Ticket";
    return "No ticket";
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
        <p style={{ color: "#90b4e8", fontSize: "12px", margin: 0 }}>Driver Panel · Hubballi Railway Station</p>
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

  if (acceptedRequest) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
        {headerBar}
        <div style={{ maxWidth: "480px", margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🚗</div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>On the way to passenger</h2>
          <p style={{ color: "#546e7a", marginBottom: "24px" }}>Please proceed to the location below.</p>
          <div style={{
            background: "#ffffff",
            border: "2px solid #003580",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            marginBottom: "24px"
          }}>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>👤 Passenger: </span>
              <strong>{acceptedRequest.passengerEmail}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>📍 Location: </span>
              <strong>{acceptedRequest.location}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>🚆 Journey: </span>
              <strong>{acceptedRequest.journeyType === "departing" ? "Departing Hubballi" : "Arriving at Hubballi"}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>🎫 Ticket: </span>
              <strong>{ticketLabel(acceptedRequest.ticketType, acceptedRequest.ticketValue)}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>💺 Seats: </span>
              <strong>{acceptedRequest.seatsNeeded}</strong>
            </p>
            {acceptedRequest.notes && (
              <p style={{ margin: "8px 0", fontSize: "15px", background: "#fff3e0", padding: "8px 12px", borderRadius: "6px" }}>
                <span style={{ color: "#e65100" }}>📝 Note: </span>
                <strong>{acceptedRequest.notes}</strong>
              </p>
            )}
          </div>
          <button
            onClick={completeRequest}
            style={{
              width: "100%",
              padding: "16px",
              background: "#2e7d32",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            ✅ Mark as Completed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {headerBar}
      <div style={{ maxWidth: "540px", margin: "40px auto", padding: "0 20px" }}>
        <div style={{
          background: "#e8eef7",
          border: "1px solid #b0bec5",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: requests.length > 0 ? "#2e7d32" : "#90a4ae"
          }} />
          <p style={{ margin: 0, fontSize: "14px", color: "#546e7a" }}>
            {requests.length > 0
              ? `${requests.length} pending request${requests.length > 1 ? "s" : ""} waiting`
              : "No pending requests right now"}
          </p>
        </div>

        {requests.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#90a4ae" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "16px" }}>Waiting for passenger requests...</p>
          </div>
        )}

        {requests.map(req => (
          <div key={req.id} style={{
            background: "#ffffff",
            border: "1px solid #b0bec5",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              background: "#e8eef7",
              padding: "12px 20px",
              borderBottom: "1px solid #b0bec5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "13px", color: "#546e7a", fontWeight: "600" }}>NEW REQUEST</span>
              <span style={{
                background: "#fff3e0",
                color: "#e65100",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600"
              }}>PENDING</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ margin: "8px 0", fontSize: "15px" }}>
                <span style={{ color: "#546e7a" }}>📍 </span>
                <strong>{req.location}</strong>
              </p>
              <p style={{ margin: "8px 0", fontSize: "15px" }}>
                <span style={{ color: "#546e7a" }}>🚆 Journey: </span>
                {req.journeyType === "departing" ? "Departing Hubballi" : "Arriving at Hubballi"}
              </p>
              <p style={{ margin: "8px 0", fontSize: "15px" }}>
                <span style={{ color: "#546e7a" }}>🎫 Ticket: </span>
                {ticketLabel(req.ticketType, req.ticketValue)}
              </p>
              <p style={{ margin: "8px 0", fontSize: "15px" }}>
                <span style={{ color: "#546e7a" }}>💺 Seats: </span>{req.seatsNeeded}
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px", color: "#546e7a" }}>
                👤 {req.passengerEmail}
              </p>
              {req.notes && (
                <p style={{ margin: "8px 0", fontSize: "14px", background: "#fff3e0", padding: "8px 12px", borderRadius: "6px" }}>
                  <span style={{ color: "#e65100" }}>📝 </span>{req.notes}
                </p>
              )}
              <button
                onClick={() => acceptRequest(req.id)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#003580",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "12px"
                }}
              >
                Accept Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DriverDashboard;