import React from "react";
import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-orange-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
         <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-400 shadow-md shadow-orange-500/20 flex-shrink-0">
            <Image
              src="/punit.png"
              alt="Punit Joshi"
              fill
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <span className="text-slate-800 font-bold text-base tracking-tight block">
             Punit Joshi
            </span>
            <span className="text-slate-400 text-[10px] font-medium">Visitor Management</span>
          </div>
        </Link>

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
