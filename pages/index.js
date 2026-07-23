import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [allowedPages, setAllowedPages] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userRole = localStorage.getItem("userRole") || "";
      const user = localStorage.getItem("username") || "";
      const pagesStr = localStorage.getItem("allowedPages");
      const pages = pagesStr ? JSON.parse(pagesStr) : [];

      setRole(userRole);
      setUsername(user);
      setAllowedPages(pages);
      setMounted(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem("allowedPages");
    setRole("");
    setUsername("");
    setAllowedPages([]);
    router.push("/login");
  };

  // Icon definitions (clean SVG icons)
  const renderIcon = (type) => {
    switch (type) {
      case "dashboard":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "visitors":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "add-visitor":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case "inward-letters":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-4a2 2 0 00-4 0H4" />
          </svg>
        );
      case "add-inward-letter":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case "letters":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case "add-letter":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "calendar":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "events":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "search":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "workers":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "permissions":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "form":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "my-submissions":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "invitations":
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  // Modules catalog
  const adminBoxes = [
    { path: "/admin", title: "Dashboard", desc: "Overview, statistics & key system analytics", iconKey: "dashboard", gradient: "from-orange-500 to-amber-500", badge: "Overview", always: true },
    { path: "/admin/visitorTable", title: "Manage Visitors", desc: "Search, filter, view details & export visitor records", iconKey: "visitors", gradient: "from-amber-500 to-orange-600", badge: "Visitors" },
    { path: "/admin/addVisitor", title: "Add Visitor", desc: "Register a new visitor entry into admin records", iconKey: "add-visitor", gradient: "from-orange-600 to-rose-500", badge: "Registration", reqPerm: "/admin/visitorTable" },
    { path: "/admin/inward-letters", title: "Inward Letters", desc: "Access and track incoming official correspondence", iconKey: "inward-letters", gradient: "from-emerald-500 to-teal-600", badge: "Letters" },
    { path: "/admin/addInwardLetter", title: "Add Inward Letter", desc: "Log a new incoming letter or document entry", iconKey: "add-inward-letter", gradient: "from-teal-500 to-emerald-600", badge: "Letters", reqPerm: "/admin/inward-letters" },
    { path: "/admin/letters", title: "Outward Letters", desc: "Access and track outgoing official letters", iconKey: "letters", gradient: "from-blue-500 to-indigo-600", badge: "Letters" },
    { path: "/admin/addLetter", title: "Add Outward Letter", desc: "Log a new outgoing letter or reference note", iconKey: "add-letter", gradient: "from-indigo-500 to-blue-600", badge: "Letters", reqPerm: "/admin/letters" },
    { path: "/admin/calendar", title: "Calendar", desc: "View event schedules, birthdays & anniversaries", iconKey: "calendar", gradient: "from-pink-500 to-rose-600", badge: "Schedule" },
    { path: "/admin/event-requests", title: "Event Requests", desc: "Review and manage event invitations", iconKey: "events", gradient: "from-purple-500 to-violet-600", badge: "Events" },
    { path: "/admin/search", title: "Global Search", desc: "Search across all visitors and letter registries", iconKey: "search", gradient: "from-cyan-500 to-blue-600", badge: "Search", always: true },
    { path: "/admin/workers", title: "Party Workers", desc: "Directory and records for party workers", iconKey: "workers", gradient: "from-amber-600 to-yellow-600", badge: "Workers", superAdminOnly: true },
    { path: "/admin/addWorker", title: "Add Party Worker", desc: "Register a new party worker or staff member", iconKey: "workers", gradient: "from-yellow-600 to-amber-700", badge: "Workers", superAdminOnly: true },
    { path: "/admin/permissions", title: "Permissions Manager", desc: "Manage accounts, passwords and module access", iconKey: "permissions", gradient: "from-rose-600 to-red-600", badge: "Admin Controls", superAdminOnly: true },
  ];

  const userBoxes = [
    { path: "/form", title: "Visitor Entry", desc: "Register new visitor details with photo & details", iconKey: "form", gradient: "from-orange-500 to-amber-500", badge: "Registration", defaultUser: true },
    { path: "/my-submissions", title: "My Entries", desc: "View status and history of registered visitors", iconKey: "my-submissions", gradient: "from-amber-500 to-orange-600", badge: "History", defaultUser: true },
    // { path: "/inward-letters", title: "Inward Letters", desc: "View incoming correspondence registry", iconKey: "inward-letters", gradient: "from-emerald-500 to-teal-600", badge: "Letters" },
    // { path: "/addInwardLetter", title: "Add Inward Letter", desc: "Submit a new incoming letter record", iconKey: "add-inward-letter", gradient: "from-teal-500 to-emerald-600", badge: "Letters", reqPerm: "/inward-letters" },
    // { path: "/letters", title: "Outward Letters", desc: "View outgoing correspondence registry", iconKey: "letters", gradient: "from-blue-500 to-indigo-600", badge: "Letters" },
    // { path: "/addLetter", title: "Add Outward Letter", desc: "Submit a new outgoing letter record", iconKey: "add-letter", gradient: "from-indigo-500 to-blue-600", badge: "Letters", reqPerm: "/letters" },
    { path: "/invitations", title: "Saheb Invitations", desc: "Access the Saheb invitations & events list", iconKey: "invitations", gradient: "from-purple-500 to-rose-500", badge: "Invitations" },
  ];

  // Filter boxes based on user role and permissions
  let visibleBoxes = [];
  if (role === "admin") {
    if (username === "admin") {
      visibleBoxes = adminBoxes;
    } else {
      visibleBoxes = adminBoxes.filter((box) => {
        if (box.superAdminOnly) return false;
        if (box.always) return true;
        if (allowedPages.includes(box.path)) return true;
        if (box.reqPerm && allowedPages.includes(box.reqPerm)) return true;
        return false;
      });
    }
  } else if (role === "user") {
    visibleBoxes = userBoxes.filter((box) => {
      if (box.defaultUser) return true;
      if (allowedPages.includes(box.path)) return true;
      if (box.reqPerm && allowedPages.includes(box.reqPerm)) return true;
      return false;
    });
  }

  const isSuperAdmin = role === "admin" && username === "admin";
  const isSubAdmin = role === "admin" && username !== "admin";
  const roleLabel = isSuperAdmin ? "Super Admin" : isSubAdmin ? `Sub Admin (${username})` : role === "user" ? `Office Staff (${username || "User"})` : "";

  return (
    <>
      <Head>
        <title>Punit Joshi – Visitor Management Portal</title>
        <meta name="description" content="Visitor Management System for Punit Joshi. Register and manage visitors efficiently." />
        <link rel="icon" href="/punit.png" />
      </Head>

      <main className="min-h-[85vh] py-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-orange-400 shadow-xl shadow-orange-500/25 mb-4">
            <Image
              src="/punit.png"
              alt="Punit Joshi"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Punit Joshi
          </h1>
          <span className="mt-1.5 inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide uppercase">
            Visitor Management Portal
          </span>
        </div>

        {/* If Not Logged In */}
        {mounted && !role && (
          <div className="max-w-md mx-auto bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-slate-800 font-bold text-lg">Welcome to the Portal</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Please log in with your credentials to access your designated workspace navigation dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/form"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all text-center"
              >
                Office Entry Form
              </Link>
              <Link
                href="/login"
                className="w-full py-3.5 rounded-2xl border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-sm transition-all text-center"
              >
                Login Portal
              </Link>
            </div>
          </div>
        )}

        {/* If Logged In: Show Dynamic Navigation Grid */}
        {mounted && role && (
          <div className="space-y-6 animate-fade-in">
            {/* User Greeting & Header Bar */}
            <div className="bg-white border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {(username?.[0] || role?.[0] || "U").toUpperCase()}
                </div>
                <div>
                  <h2 className="text-slate-800 font-bold text-base flex items-center gap-2">
                    Welcome back, {username || (role === "admin" ? "Admin" : "Officer")}!
                  </h2>
                  <p className="text-xs text-slate-500">
                    Role: <span className="font-semibold text-orange-600">{roleLabel}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            {/* Navigation Grid Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Quick Navigation Workspace</h3>
                <p className="text-xs text-slate-500">Select a module below to open its dedicated workspace page.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                {visibleBoxes.length} Modules Available
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleBoxes.map((box) => (
                <Link
                  key={box.path}
                  href={box.path}
                  className="group bg-white border border-orange-100/80 hover:border-orange-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    {/* Top Bar: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${box.gradient} flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform`}>
                        {renderIcon(box.iconKey)}
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                        {box.badge}
                      </span>
                    </div>

                    {/* Content: Title & Desc */}
                    <div>
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                        {box.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {box.desc}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Link */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-orange-600 group-hover:text-orange-700">
                    <span>Open Module</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
