import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const Navbarr = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin/visitorTable", label: "Visitors", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <aside
      className={`flex flex-col bg-white border-r border-orange-100 min-h-screen shadow-sm transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-50">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-400 shadow-md flex-shrink-0">
          <Image
            src="/punit.png"
            alt="Punit Joshi"
            fill
            className="object-cover"
          />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <p className="text-slate-800 font-bold text-sm whitespace-nowrap">
              Punit <span className="text-orange-500">Joshi</span>
            </p>
            <p className="text-slate-400 text-[10px] font-medium">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto p-1 rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navLinks.map(({ href, label, icon }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 border border-orange-200/50"
                  : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
              title={collapsed ? label : ""}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-orange-50 pt-3">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : ""}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Navbarr;
