import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home"; // ✅ real Home.jsx
import About from "./pages/About";

import "../css/app.css";

import Announcements from "./pages/Announcements";

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-blue-600 text-white flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/announcements">Announcements</Link>
        <Link to="/auth">Sign Up / Login</Link>
      </nav>

      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />  {/* ✅ Using real Home.jsx */}
          <Route path="/about" element={<About />} />
          <Route path="/announcements" element={<Announcements />} />
        </Routes>
      </div>
    </Router>
  );
}
