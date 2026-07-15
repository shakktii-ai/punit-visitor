import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const Navbarr = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("");
  const [allowedPages, setAllowedPages] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "");
      const pagesStr = localStorage.getItem("allowedPages");
      setAllowedPages(pagesStr ? JSON.parse(pagesStr) : []);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("allowedPages");
    router.push("/login");
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin/search", label: "Global Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { href: "/admin/visitorTable", label: "Visitors", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { href: "/admin/workers", label: "Party Workers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { href: "/admin/addWorker", label: "Add Party Worker", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
    { href: "/admin/inward-letters", label: "Inward Letters", icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-4a2 2 0 00-4 0H4" },
    { href: "/admin/addInwardLetter", label: "Add Inward Letter", icon: "M12 4v16m8-8H4" },
    { href: "/admin/letters", label: "Outward Letters", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { href: "/admin/addLetter", label: "Add Outward Letter", icon: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/admin/calendar", label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/admin/event-requests", label: "Event Requests", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { href: "/admin/permissions", label: "Permissions", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
  ];

  const filteredLinks = navLinks.filter(({ href }) => {
    if (href === "/admin/permissions") return username === "admin";
    if (username === "admin") return true;
    if (href === "/admin") return true;
    if (href === "/admin/search") return true;
    if (href === "/admin/addWorker") return allowedPages.includes("/admin/workers");
    if (href === "/admin/addLetter") return allowedPages.includes("/admin/letters");
    if (href === "/admin/addInwardLetter") return allowedPages.includes("/admin/inward-letters");
    return allowedPages.includes(href);
  });

  return (
    <aside
      className={`flex flex-col bg-white border-r border-orange-100 min-h-screen shadow-sm transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Profile Header */}
      <div className={`flex border-b border-orange-50 ${
        collapsed ? "flex-col-reverse items-center gap-3 py-4 px-2" : "items-center gap-3 px-4 py-4"
      }`}>
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-400 shadow-md flex-shrink-0">
          <Image
            src="/punit.png"
            alt="Punit Joshi"
            fill
            className="object-cover"
          />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-slate-800 font-bold text-sm whitespace-nowrap">
                Punit Joshi
            </p>
            <p className="text-slate-400 text-[10px] font-medium">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-1 rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {filteredLinks.map(({ href, label, icon }) => {
          const active = router.pathname === href || router.pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 group ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              } ${
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
