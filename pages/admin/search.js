import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Link from "next/link";
import { HiSearch, HiUser, HiUsers, HiMail, HiMailOpen, HiEye, HiPencil } from "react-icons/hi";

const TABS = [
  { id: "all", label: "All Results", icon: <HiSearch className="w-4 h-4" /> },
  { id: "visitors", label: "Visitors", icon: <HiUser className="w-4 h-4" /> },
  { id: "workers", label: "Party Workers", icon: <HiUsers className="w-4 h-4" /> },
  { id: "inward", label: "Inward Letters", icon: <HiMailOpen className="w-4 h-4" /> },
  { id: "outward", label: "Outward Letters", icon: <HiMail className="w-4 h-4" /> },
];

export default function GlobalSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({
    visitors: [],
    workers: [],
    inwardLetters: [],
    outwardLetters: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  // Handle URL query param on mount
  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
      performSearch(router.query.q);
    }
  }, [router.query.q]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const role = localStorage.getItem("userRole") || "";
      const username = localStorage.getItem("username") || "";

      const res = await fetch(`/api/global-search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "x-user-role": role,
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results);
      } else {
        toast.error(data.error || "Search query failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to search server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/admin/search",
      query: { q: query },
    }, undefined, { shallow: true });
    performSearch(query);
  };

  const visitorsCount = results.visitors.length;
  const workersCount = results.workers.length;
  const inwardCount = results.inwardLetters.length;
  const outwardCount = results.outwardLetters.length;
  const totalCount = visitorsCount + workersCount + inwardCount + outwardCount;

  return (
    <>
      <Head>
        <title>Global Search – VisitorPass Admin</title>
        <meta name="description" content="Search across the entire database registry." />
      </Head>

      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Global Database Search
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Search visitors, party workers, inward, and outward letters instantly by Name, Contact, or Document Number.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-white border border-orange-100 rounded-3xl p-5 md:p-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search name, phone number, village, letter number, subject..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-500/20 text-sm md:text-base flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {searched && !loading && (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-slate-100 gap-2 md:gap-4">
              {TABS.map((tab) => {
                let count = 0;
                if (tab.id === "all") count = totalCount;
                if (tab.id === "visitors") count = visitorsCount;
                if (tab.id === "workers") count = workersCount;
                if (tab.id === "inward") count = inwardCount;
                if (tab.id === "outward") count = outwardCount;

                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 px-1 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 outline-none ${
                      active
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Results Grid */}
            <div className="space-y-8">
              {totalCount === 0 ? (
                <div className="text-center py-20 bg-white border border-orange-100 rounded-3xl p-6 shadow-sm max-w-md mx-auto space-y-3">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500 text-2xl">
                    🔍
                  </div>
                  <h3 className="font-bold text-slate-800">No records found</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    We couldn't find any matches for "{query}". Check your spelling or try searching with different keywords.
                  </p>
                </div>
              ) : (
                <>
                  {/* Visitors Section */}
                  {(activeTab === "all" || activeTab === "visitors") && visitorsCount > 0 && (
                    <div className="bg-white border border-orange-100/80 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-slate-800 font-bold text-base flex items-center gap-2 pb-2 border-b border-slate-50">
                        <HiUser className="text-orange-500" />
                        Visitors ({visitorsCount})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-orange-50/40 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-3">Visitor Name</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3">Address</th>
                              <th className="px-4 py-3">Purpose</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Registered Date</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.visitors.map((v) => (
                              <tr key={v._id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {v.photos ? (
                                      <img src={v.photos} alt="" className="w-7 h-7 rounded-full object-cover border" />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                                        {v.fullName?.[0]}
                                      </div>
                                    )}
                                    <span className="font-bold text-slate-800">{v.fullName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-700">{v.phoneNo}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={v.address || v.village}>
                                  {v.address || v.village || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                    {v.purpose === "Other" && v.customPurpose ? v.customPurpose : v.purpose}
                                    {v.purpose === "DRAINAGE" && v.subPurpose ? ` - ${v.subPurpose === "Other" && v.customPurpose ? v.customPurpose : v.subPurpose}` : ""}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-700">{v.status || "Pending"}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs">
                                  {new Date(v.createdAt).toLocaleDateString("en-IN")}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Link
                                    href={`/admin/visitorTable?id=${v._id}`}
                                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                                  >
                                    <HiEye className="w-3.5 h-3.5" /> View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Workers Section */}
                  {(activeTab === "all" || activeTab === "workers") && workersCount > 0 && (
                    <div className="bg-white border border-orange-100/80 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-slate-800 font-bold text-base flex items-center gap-2 pb-2 border-b border-slate-50">
                        <HiUsers className="text-orange-500" />
                        Party Workers ({workersCount})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-orange-50/40 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-3">Worker Name</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3">Position</th>
                              <th className="px-4 py-3">Location (Village)</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.workers.map((w) => (
                              <tr key={w._id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3">
                                  <span className="font-bold text-slate-800">
                                    {`${w.firstName} ${w.middleName || ""} ${w.lastName}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-700">{w.primaryPhone}</td>
                                <td className="px-4 py-3 text-slate-600 font-medium">{w.position}</td>
                                <td className="px-4 py-3 text-slate-500">{w.village || "—"}</td>
                                <td className="px-4 py-3 text-right">
                                  <Link
                                    href={`/admin/workers?search=${encodeURIComponent(w.firstName)}`}
                                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                                  >
                                    <HiEye className="w-3.5 h-3.5" /> View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Inward Letters Section */}
                  {(activeTab === "all" || activeTab === "inward") && inwardCount > 0 && (
                    <div className="bg-white border border-orange-100/80 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-slate-800 font-bold text-base flex items-center gap-2 pb-2 border-b border-slate-50">
                        <HiMailOpen className="text-orange-500" />
                        Inward Letters ({inwardCount})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-orange-50/40 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-3">Inward Number</th>
                              <th className="px-4 py-3">Subject</th>
                              <th className="px-4 py-3">Sender Details</th>
                              <th className="px-4 py-3">Assigned Person</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.inwardLetters.map((l) => (
                              <tr key={l._id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-bold text-orange-600">{l.inwardNumber}</td>
                                <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate" title={l.subject}>
                                  {l.subject}
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-700">{l.senderName || "—"}</p>
                                  <p className="text-xs text-slate-400">{l.senderContact || ""}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{l.assignedPerson || "—"}</td>
                                <td className="px-4 py-3 font-semibold text-slate-700">{l.status || "Pending"}</td>
                                <td className="px-4 py-3 text-right">
                                  <Link
                                    href={`/admin/inward-letters?search=${encodeURIComponent(l.inwardNumber)}`}
                                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                                  >
                                    <HiEye className="w-3.5 h-3.5" /> View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Outward Letters Section */}
                  {(activeTab === "all" || activeTab === "outward") && outwardCount > 0 && (
                    <div className="bg-white border border-orange-100/80 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-slate-800 font-bold text-base flex items-center gap-2 pb-2 border-b border-slate-50">
                        <HiMail className="text-orange-500" />
                        Outward Letters ({outwardCount})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-orange-50/40 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-3">Outward Number</th>
                              <th className="px-4 py-3">Subject</th>
                              <th className="px-4 py-3">Addressed To</th>
                              <th className="px-4 py-3">Assigned Person</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {results.outwardLetters.map((l) => (
                              <tr key={l._id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-bold text-orange-600">{l.inwardNumber}</td>
                                <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate" title={l.subject}>
                                  {l.subject}
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-slate-700">{l.letterAddressedTo || "—"}</p>
                                  <p className="text-xs text-slate-400">{l.contactNumber || ""}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{l.assignedPerson || "—"}</td>
                                <td className="px-4 py-3 text-right">
                                  <Link
                                    href={`/admin/letters?search=${encodeURIComponent(l.inwardNumber)}`}
                                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                                  >
                                    <HiEye className="w-3.5 h-3.5" /> View
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
