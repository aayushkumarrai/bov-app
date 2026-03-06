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

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{ padding: "6px 14px", background: "red", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
        {[
          { label: "Total Requests", value: requests.length, color: "#333" },
          { label: "Pending", value: pending, color: "orange" },
          { label: "Accepted", value: accepted, color: "blue" },
          { label: "Completed", value: completed, color: "green" },
          { label: "Drivers", value: drivers, color: "purple" },
          { label: "Passengers", value: passengers, color: "teal" },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: "1",
            minWidth: "100px",
            background: stat.color,
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{stat.value}</div>
            <div style={{ fontSize: "12px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Requests Table */}
      <h3>All Requests</h3>
      {requests.length === 0 && <p style={{ color: "gray" }}>No requests yet.</p>}
      {requests.map(req => (
        <div key={req.id} style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "10px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>{req.passengerEmail}</strong></span>
            <span style={{
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              background: req.status === "pending" ? "orange" : req.status === "accepted" ? "blue" : "green",
              color: "white"
            }}>{req.status}</span>
          </div>
          <p style={{ margin: "5px 0" }}>📍 {req.location}</p>
          <p style={{ margin: "5px 0" }}>🚂 Train: {req.trainNumber} | Seats: {req.seatsNeeded}</p>
          {req.driverEmail && <p style={{ margin: "5px 0" }}>🚗 Driver: {req.driverEmail}</p>}
        </div>
      ))}

      {/* Users */}
      <h3 style={{ marginTop: "30px" }}>Registered Users</h3>
      {users.map(user => (
        <div key={user.id} style={{
          border: "1px solid #444",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "8px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{user.email}</span>
          <span style={{
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            background: user.role === "driver" ? "purple" : "teal",
            color: "white"
          }}>{user.role}</span>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;