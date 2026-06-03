import React from "react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-orange-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-slate-700 font-bold text-sm">
              Visitor<span className="text-orange-500">Pass</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <Link href="/form" className="hover:text-orange-500 transition-colors">Register</Link>
            <Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            &copy; {year} VisitorPass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
