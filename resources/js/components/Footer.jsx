// components/Footer.jsx
import React from "react";
import { Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-gray-900">
      <div className="container mx-auto px-4 text-center text-gray-300">
        <h3 className="text-lg font-semibold text-white mb-6">
          SK Tumana 2023
        </h3>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
          <a
            href="https://www.facebook.com/p/SK-Tumana-2023-61553850061537/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition"
          >
            <Facebook size={18} />
            <span>SK Tumana 2023</span>
          </a>

          <a
            href="https://www.instagram.com/sktumana/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition"
          >
            <Instagram size={18} />
            <span>@sktumana</span>
          </a>

          <a
            href="mailto:sktumana.marikina@gmail.com"
            className="flex items-center gap-2 hover:text-white transition"
          >
            <Mail size={18} />
            <span>sktumana.marikina@gmail.com</span>
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} SK Tumana. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;