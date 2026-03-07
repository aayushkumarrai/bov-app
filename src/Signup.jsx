import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const ADMIN_EMAIL = "admin@bov.com";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (email === ADMIN_EMAIL) {
      setError("This email is reserved.");
      return;
    }
    if (!role) {
      setError("Please select your role to continue.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role
      });
      if (role === "passenger") navigate("/passenger");
      else navigate("/driver");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f4f8"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
      }}>
        {/* Header */}
        <div style={{
          background: "#003580",
          padding: "28px 40px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "44px", marginBottom: "8px" }}>🚆</div>
          <h2 style={{
            color: "#ffffff",
            fontSize: "22px",
            fontFamily: "Noto Serif, serif",
            marginBottom: "4px"
          }}>
            Create Account
          </h2>
          <p style={{ color: "#90b4e8", fontSize: "13px" }}>
            Hubballi Railway Station BOV Service
          </p>
        </div>

        {/* Form */}
        <div style={{ background: "#ffffff", padding: "32px 40px" }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <p style={{
            fontSize: "13px",
            color: "#546e7a",
            marginBottom: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            I am registering as:
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {[
              { value: "passenger", label: "Passenger", icon: "🧑" },
              { value: "driver", label: "BOV Driver", icon: "🚗" }
            ].map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: role === r.value ? "#003580" : "#f0f4f8",
                  color: role === r.value ? "#ffffff" : "#546e7a",
                  border: `2px solid ${role === r.value ? "#003580" : "#b0bec5"}`,
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{r.icon}</div>
                {r.label}
              </button>
            ))}
          </div>

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
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#90a4ae" : "#003580",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#546e7a",
            fontSize: "14px"
          }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>

        {/* Footer */}
        <div style={{
          background: "#e8eef7",
          padding: "12px 40px",
          textAlign: "center"
        }}>
          <p style={{ fontSize: "12px", color: "#78909c" }}>
            Indian Railways · Ministry of Railways · Government of India
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;