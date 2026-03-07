import { useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const ADMIN_EMAIL = "admin@bov.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.email === ADMIN_EMAIL) {
        navigate("/admin");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data().role;
      if (role === "passenger") navigate("/passenger");
      else navigate("/driver");
    } catch (e) {
      setError("Invalid email or password. Please try again.");
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
        padding: "0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
      }}>
        {/* Header */}
        <div style={{
          background: "#003580",
          padding: "32px 40px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🚆</div>
          <h2 style={{
            color: "#ffffff",
            fontSize: "22px",
            fontFamily: "Noto Serif, serif",
            marginBottom: "4px"
          }}>
            Where is my BOV?
          </h2>
          <p style={{ color: "#90b4e8", fontSize: "13px" }}>
            Hubballi Railway Station · Battery Operated Vehicle Service
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: "#ffffff",
          padding: "32px 40px"
        }}>
          <p style={{
            fontSize: "13px",
            color: "#546e7a",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: "500",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            Sign in to continue
          </p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
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
            onClick={handleLogin}
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
              letterSpacing: "0.5px",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#546e7a",
            fontSize: "14px"
          }}>
            New user? <Link to="/signup">Create Account</Link>
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

export default Login;