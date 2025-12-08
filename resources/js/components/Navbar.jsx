import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { pathname } = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Announcements", path: "/announcements" },
    { name: "Facilities", path: "/facilities" },
    { name: "Projects", path: "/projects" },
    { name: "Accomplishments", path: "/accomplishments" },
    { name: "Disclosure Board", path: "/disclosure" },
    { name: "Reports", path: "/reports" },
    { name: "Submit Request", path: "/requests" },
    { name: "File Printing", path: "/printing" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary">
          SK Kagawad Link
        </Link>

        {/* Menu Links */}
        <div className="hidden md:flex gap-6">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className={`hover:text-primary ${
                pathname === link.path ? "text-primary font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
