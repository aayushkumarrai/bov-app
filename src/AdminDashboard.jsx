import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const pending = requests.filter(r => r.status === "pending").length;
  const accepted = requests.filter(r => r.status === "accepted").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const drivers = users.filter(u => u.role === "driver").length;
  const passengers = users.filter(u => u.role === "passenger").length;

  const statusColor = (status) => {
    if (status === "pending") return { bg: "#fff3e0", color: "#e65100" };
    if (status === "accepted") return { bg: "#e3f2fd", color: "#1565c0" };
    if (status === "completed") return { bg: "#e8f5e9", color: "#2e7d32" };
    return { bg: "#f5f5f5", color: "#546e7a" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Header */}
      <div style={{
        background: "#003580",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <p style={{ color: "#ffffff", fontWeight: "700", fontSize: "16px", margin: 0 }}>🚆 Where is my BOV?</p>
          <p style={{ color: "#90b4e8", fontSize: "12px", margin: 0 }}>Admin Panel · Hubballi Railway Station</p>
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

      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>

        {/* Stats */}
        <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#546e7a", letterSpacing: "0.5px" }}>
          LIVE OVERVIEW
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Total Requests", value: requests.length, bg: "#003580", color: "#fff" },
            { label: "Pending", value: pending, bg: "#e65100", color: "#fff" },
            { label: "Accepted", value: accepted, bg: "#1565c0", color: "#fff" },
            { label: "Completed", value: completed, bg: "#2e7d32", color: "#fff" },
            { label: "Drivers", value: drivers, bg: "#4a148c", color: "#fff" },
            { label: "Passengers", value: passengers, bg: "#00695c", color: "#fff" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg,
              color: stat.color,
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "32px", fontWeight: "700" }}>{stat.value}</div>
              <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Requests */}
        <h3 style={{ marginBottom: "16px", fontSize: "16px", color: "#546e7a", letterSpacing: "0.5px" }}>
          ALL REQUESTS
        </h3>
        {requests.length === 0 && (
          <p style={{ color: "#90a4ae", textAlign: "center", padding: "40px" }}>No requests yet.</p>
        )}
        {requests.map(req => {
          const s = statusColor(req.status);
          return (
            <div key={req.id} style={{
              background: "#ffffff",
              border: "1px solid #b0bec5",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "12px"
            }}>
              <div style={{
                padding: "12px 20px",
                background: "#e8eef7",
                borderBottom: "1px solid #b0bec5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#003580" }}>
                  {req.passengerEmail}
                </span>
                <span style={{
                  background: s.bg,
                  color: s.color,
                  padding: "3px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase"
                }}>
                  {req.status}
                </span>
              </div>
              <div style={{ padding: "14px 20px" }}>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <span style={{ color: "#546e7a" }}>📍 </span>{req.location}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <span style={{ color: "#546e7a" }}>🚂 Train: </span>{req.trainNumber}
                  <span style={{ marginLeft: "16px", color: "#546e7a" }}>💺 Seats: </span>{req.seatsNeeded}
                </p>
                {req.driverEmail && (
                  <p style={{ margin: "4px 0", fontSize: "14px" }}>
                    <span style={{ color: "#546e7a" }}>🚗 Driver: </span>{req.driverEmail}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Users */}
        <h3 style={{ marginBottom: "16px", marginTop: "32px", fontSize: "16px", color: "#546e7a", letterSpacing: "0.5px" }}>
          REGISTERED USERS
        </h3>
        {users.map(user => (
          <div key={user.id} style={{
            background: "#ffffff",
            border: "1px solid #b0bec5",
            borderRadius: "8px",
            padding: "12px 20px",
            marginBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "14px" }}>{user.email}</span>
            <span style={{
              background: user.role === "driver" ? "#4a148c" : "#00695c",
              color: "#ffffff",
              padding: "3px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase"
            }}>
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;