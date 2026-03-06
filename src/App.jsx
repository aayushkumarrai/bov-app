import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import PassengerDashboard from "./PassengerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passenger" element={<PassengerDashboard />} />
        <Route path="/driver" element={<h1>Driver Dashboard - Coming Soon</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;