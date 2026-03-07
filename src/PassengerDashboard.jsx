import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
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
  const [journeyType, setJourneyType] = useState("");
  const [ticketType, setTicketType] = useState("none");
  const [ticketValue, setTicketValue] = useState("");
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState("");
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
        const d = snapshot.docs[0];
        setActiveRequest({ id: d.id, ...d.data() });
      } else {
        setActiveRequest(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async () => {
    if (!location || !journeyType) {
      setError("Please fill all required fields.");
      return;
    }
    if ((ticketType === "pnr" || ticketType === "train") && !ticketValue) {
      setError("Please enter your ticket details.");
      return;
    }
    try {
      await addDoc(collection(db, "requests"), {
        passengerId: auth.currentUser.uid,
        passengerEmail: auth.currentUser.email,
        location,
        journeyType,
        ticketType,
        ticketValue,
        seatsNeeded: seats,
        notes,
        status: "pending",
        timestamp: serverTimestamp()
      });
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCancel = async () => {
    if (!activeRequest) return;
    await updateDoc(doc(db, "requests", activeRequest.id), {
      status: "cancelled"
    });
    setActiveRequest(null);
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
            Your request has been sent to all available BOV drivers.
          </p>
          <div style={{
            background: "#ffffff",
            border: "1px solid #b0bec5",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "left",
            marginBottom: "20px"
          }}>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>📍 Location: </span>
              <strong>{activeRequest.location}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>🚆 Journey: </span>
              <strong>{activeRequest.journeyType === "departing" ? "Departing Hubballi" : "Arriving at Hubballi"}</strong>
            </p>
            <p style={{ margin: "8px 0", fontSize: "15px" }}>
              <span style={{ color: "#546e7a" }}>💺 Seats: </span>
              <strong>{activeRequest.seatsNeeded}</strong>
            </p>
            {activeRequest.notes && (
              <p style={{ margin: "8px 0", fontSize: "15px" }}>
                <span style={{ color: "#546e7a" }}>📝 Notes: </span>
                <strong>{activeRequest.notes}</strong>
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            style={{
              width: "100%",
              padding: "14px",
              background: "#ffffff",
              color: "#c62828",
              border: "2px solid #c62828",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Cancel Request
          </button>
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
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              JOURNEY TYPE *
            </label>
            <select value={journeyType} onChange={e => setJourneyType(e.target.value)}>
              <option value="">-- Select journey type --</option>
              <option value="departing">Departing from Hubballi</option>
              <option value="arriving">Arriving at Hubballi</option>
            </select>

            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              YOUR CURRENT LOCATION *
            </label>
            <select value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">-- Select your location --</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              TICKET TYPE
            </label>
            <select value={ticketType} onChange={e => { setTicketType(e.target.value); setTicketValue(""); }}>
              <option value="none">No ticket / Not available</option>
              <option value="pnr">PNR Number</option>
              <option value="train">Train Number</option>
              <option value="uts">UTS Ticket</option>
            </select>

            {(ticketType === "pnr" || ticketType === "train") && (
              <>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
                  {ticketType === "pnr" ? "ENTER PNR NUMBER" : "ENTER TRAIN NUMBER"}
                </label>
                <input
                  type="text"
                  placeholder={ticketType === "pnr" ? "e.g. 8714521369" : "e.g. 16590"}
                  value={ticketValue}
                  onChange={e => setTicketValue(e.target.value)}
                />
              </>
            )}

            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              SEATS NEEDED
            </label>
            <select value={seats} onChange={e => setSeats(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? "seat" : "seats"}</option>
              ))}
            </select>

            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#546e7a", marginBottom: "6px" }}>
              SPECIAL NOTES (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Wheelchair needed, heavy luggage, elderly passenger"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

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