import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "../css/app.css";

// Public Pages
import Home from "./pages/Public/Home";
import About from "./pages/Public/About";
import Announcements from "./pages/Public/Announcements";
import Facilities from "./pages/Public/Facilities";
import Projects from "./pages/Public/Projects";
import Accomplishments from "./pages/Public/Accomplishments";
import Disclosure from "./pages/Public/Disclosure";
import Reports from "./pages/Public/Reports";
import Requests from "./pages/Public/Requests";
import FilePrinting from "./pages/Public/FilePrinting";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Register from "./pages/admin/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAbout from "./pages/admin/About";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminProjects from "./pages/admin/Projects";
import AdminFacilities from "./pages/admin/Facilities";
import AdminDisclosure from "./pages/admin/Disclosure";
import AdminReports from "./pages/admin/Reports";
import AdminRequests from "./pages/admin/Requests";
import AdminKKID from "./pages/admin/KKID";
import AdminFilePrinting from "./pages/admin/FilePrinting";
import AdminAccomplishments from "./pages/Admin/Accomplishments";

// Components
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";
import Footer from "./components/Footer";

// Auth protection component
const ProtectedRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const authToken = localStorage.getItem('authToken');
  
  const isAuthenticated = authToken && (userRole === 'admin' || userRole === 'staff');
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet /> {/* This is where the public page content will be rendered */}
    <Footer /> {/* Footer added */}
  </>
);

// Admin Layout component
export const AdminLayout = () => (
  <>
    <AdminNavbar />
    <Outlet /> {/* This is where the admin page content will be rendered */}
    <Footer /> {/* Footer added */}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/accomplishments" element={<Accomplishments />} />
          <Route path="/disclosure" element={<Disclosure />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/printing" element={<FilePrinting />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<Register />} />
        
        {/* Protected Admin Routes with Layout */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="facilities" element={<AdminFacilities />} />
          <Route path="accomplishments" element={<AdminAccomplishments />} />
          <Route path="disclosure" element={<AdminDisclosure />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="kkid" element={<AdminKKID />} />
          <Route path="printing" element={<AdminFilePrinting />} />
          
          {/* Redirect /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Check if the element exists before rendering
const rootElement = document.getElementById("app");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error("Root element 'app' not found");
}