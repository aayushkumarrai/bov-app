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
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (email === ADMIN_EMAIL) {
      setError("This email is reserved.");
      return;
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }
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
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
      <h2>Create Account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "8px" }}
      />
      <p>I am a:</p>
      <button
        onClick={() => setRole("passenger")}
        style={{ marginRight: "10px", padding: "10px 20px", background: role === "passenger" ? "green" : "gray", color: "white", border: "none", cursor: "pointer" }}
      >
        Passenger
      </button>
      <button
        onClick={() => setRole("driver")}
        style={{ padding: "10px 20px", background: role === "driver" ? "green" : "gray", color: "white", border: "none", cursor: "pointer" }}
      >
        Driver
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      <br /><br />
      <button
        onClick={handleSignup}
        style={{ padding: "10px 30px", background: "blue", color: "white", border: "none", cursor: "pointer" }}
      >
        Sign Up
      </button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Signup;