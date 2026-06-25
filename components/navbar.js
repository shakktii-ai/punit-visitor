import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo + Punit Joshi */}
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            Home
          </Link>
          <Link
            href="/form"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/form" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            Register
          </Link>
          <Link
            href="/my-submissions"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/my-submissions" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            My Submissions
          </Link>
          <Link
            href="/workers"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/workers" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            Party Workers
          </Link>
          <Link
            href="/letters"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/letters" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            My Letters
          </Link>
          <Link
            href="/invitations"
            className={`text-sm font-medium transition-colors ${
              router.pathname === "/invitations" ? "text-orange-500" : "text-slate-600 hover:text-orange-500"
            }`}
          >
            Saheb Invitations
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-orange-50 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-orange-50 bg-white">
          {/* Mobile Profile */}
          <div className="flex items-center gap-2.5 py-3 border-b border-orange-50">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-300 shadow-sm flex-shrink-0">
              <Image src="/punit.png" alt="Punit Joshi" fill className="object-cover" />
            </div>
            <div>
              <p className="text-slate-800 text-sm font-bold">Punit Joshi</p>
              <p className="text-orange-500 text-xs">Visitor Management</p>
            </div>
          </div>
          <Link href="/" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            Home
          </Link>
          <Link href="/form" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            Register
          </Link>
          <Link href="/my-submissions" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            My Submissions
          </Link>
          <Link href="/workers" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            Party Workers
          </Link>
          <Link href="/letters" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            My Letters
          </Link>
          <Link href="/invitations" className="block py-2 text-sm font-medium text-slate-700 hover:text-orange-500 transition-colors">
            Saheb Invitations
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
