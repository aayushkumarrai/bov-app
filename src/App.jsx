import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const testFirebase = async () => {
    try {
      await addDoc(collection(db, "test"), {
        message: "Firebase is connected!",
        time: new Date()
      });
      alert("✅ Firebase connected! Check Firestore console.");
    } catch (e) {
      alert("❌ Error: " + e.message);
    }
  };

  return (
    <div>
      <h1>BOV App</h1>
      <button onClick={testFirebase}>Test Firebase Connection</button>
    </div>
  );
}

export default App;