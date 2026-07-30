import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  HiSearch,
  HiUser,
  HiPhone,
  HiLocationMarker,
  HiChevronRight,
  HiFilter,
  HiRefresh,
  HiCalendar,
} from "react-icons/hi";

const PURPOSES = [
  "MEET WITH DADA",
  "ROAD",
  "FOOTPATH",
  "DRAINAGE",
  "WATER",
  "STORM WATER CRISIS",
  "WASTE MANAGEMENT",
  "FOLLIAGE MANAGEMENT",
  "DEBRIS MANAGEMENT",
  "TREE CUTTING",
  "STREET LIGHTS",
  "DEATH INTIMATION LETTER",
  "JOB REFERENCE LETTER",
  "MSEB",
  "BIRTH & DEATH CERTIFICATE CORRECTION",
  "RECOMONDATION LETTER",
  "ADMISSION LETTER",
  "TOILET",
  "MEDICAL ASSIT.",
  "AMBULANCE",
  "RATION KIT",
  "MONITERY HELP",
  "CHAIRTY",
  "IN KIND HELP",
  "TANKER",
  "SCHOOL / COLLEGE FEE LETTER",
  "OTHER"
];

export default function VisitorProfilesIndex() {
  const router = useRouter();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "admin") {
      router.push("/login");
    } else if (username !== "admin" && !allowedPages.includes("/admin/visitorTable")) {
      router.push("/admin");
    }
  }, [router]);

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, purpose, sort: "newest" });
      const res = await fetch(`/api/visitors?${params}`);
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error("Failed to fetch visitors.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading visitor cards.");
    } finally {
      setLoading(false);
    }
  }, [page, search, purpose]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handlePurposeChange = (val) => {
    setPurpose(val);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    let color = "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "In Progress") color = "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "Completed") color = "bg-green-100 text-green-700 border-green-200";
    if (status === "Rejected") color = "bg-red-100 text-red-700 border-red-200";
    return (
      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${color}`}>
        {status || "Pending"}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Visitor Profiles – Admin</title>
        <meta name="description" content="Browse visitor profiles in card format." />
      </Head>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Visitor Profiles</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Browse {total} registered visitor profile{total !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={fetchVisitors}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors shadow-sm"
          >
            <HiRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitor by name, phone, village, address..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Purpose Filter */}
          <div className="relative min-w-[200px]">
            <HiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={purpose}
              onChange={(e) => handlePurposeChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Purposes</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visitor Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-orange-100 p-12 text-center text-slate-400 space-y-3">
            <HiUser className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No Visitor Profiles Found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search query or purpose filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitors.map((v) => {
              const combinedAddress = v.address || [
                v.houseNo,
                v.landmark,
                v.village,
                v.pincode ? String(v.pincode) : ""
              ].filter((val) => val && val.trim() !== "").join(", ");

              const dateStr = v.createdAt
                ? new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—";

              return (
                <div
                  key={v._id}
                  className="bg-white rounded-3xl border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Subtle top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Card Content */}
                  <div className="space-y-4">
                    {/* Visitor Avatar & Name */}
                    <div className="flex items-start gap-3.5">
                      {v.photos ? (
                        <img
                          src={v.photos}
                          alt={v.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-100 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm">
                          {v.fullName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                          {v.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <HiCalendar className="w-3.5 h-3.5 text-slate-400" />
                          {dateStr}
                        </p>
                      </div>

                      {getStatusBadge(v.status)}
                    </div>

                    {/* Contact & Location Info */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <HiPhone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="font-semibold">{v.phoneNo || "—"}</span>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <HiLocationMarker className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="truncate" title={combinedAddress}>
                          {combinedAddress || "Address not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Purpose Badge */}
                    <div>
                      <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        {v.purpose || "General Visit"}
                        {v.purpose === "DRAINAGE" && v.subPurpose ? ` (${v.subPurpose})` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: View Profile Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => router.push(`/admin/visitor-profile/${v._id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/10"
                    >
                      <span>View Complete Profile</span>
                      <HiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-slate-500 text-sm">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} visitors
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
