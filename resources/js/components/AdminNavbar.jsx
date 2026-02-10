import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AdminNavbar = () => {
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/admin/login';
    }
  };

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "About", path: "/admin/about" },
    { name: "Announcements", path: "/admin/announcements" },
    { name: "Facilities", path: "/admin/facilities" },
    { name: "Accomplishments", path: "/admin/accomplishments" },
    { name: "Projects", path: "/admin/projects" },
    { name: "Disclosure Board", path: "/admin/disclosure" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Submit Request", path: "/admin/requests" },
    { name: "KKID", path: "/admin/kkid" },
    { name: "File Printing", path: "/admin/printing" },
  ];

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-14">
        
        {/* Logo / Title */}
        <Link
          to="/admin/dashboard"
          className="text-lg font-semibold hover:text-primary"
        >
          SK Admin Portal
        </Link>

        {/* Menu Links */}
        <div className="hidden md:flex gap-4 text-sm">
          {adminLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`hover:text-primary transition ${
                pathname === link.path ? "text-primary font-medium" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-xs leading-tight text-right">
            <div className="font-medium">{userName}</div>
            <div className="text-gray-400 capitalize">{userRole}</div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-300 border border-gray-600
                      hover:text-white hover:bg-red-600 hover:border-red-600
                      transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </div>
  </nav>
  );
};

export default AdminNavbar;