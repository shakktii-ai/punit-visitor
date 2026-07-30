import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  HiClipboardList,
  HiSearch,
  HiRefresh,
  HiUser,
  HiCube,
  HiCheckCircle,
  HiPencilAlt,
  HiTrash,
  HiShieldCheck,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

export default function AdminSystemLogs() {
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    createCount: 0,
    updateCount: 0,
    deleteCount: 0,
    statusCount: 0,
  });

  // Filter States
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const limit = 15;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      const username = localStorage.getItem("username");
      const allowedPagesStr = localStorage.getItem("allowedPages");
      const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];
      const HARDCODED_SUBADMINS = ["MKulkarni", "Deshmukh", "admin"];

      const isAuthorized =
        role === "admin" ||
        HARDCODED_SUBADMINS.includes(username) ||
        allowedPages.includes("/admin/logs");

      if (!isAuthorized) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/admin");
      }
    }
  }, [router]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        moduleFilter,
        actionFilter,
        sort,
      });
      const res = await fetch(`/api/system-logs?${params}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || "Failed to load audit logs");
      }
    } catch (err) {
      console.error("Error fetching system logs:", err);
      toast.error("Failed to connect to logs server");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, moduleFilter, actionFilter, sort]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Badge Color & Icon Helper
  const getActionBadge = (action) => {
    switch (action) {
      case "CREATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <HiCheckCircle className="w-3.5 h-3.5" /> CREATE
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <HiPencilAlt className="w-3.5 h-3.5" /> UPDATE
          </span>
        );
      case "STATUS_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <HiRefresh className="w-3.5 h-3.5" /> STATUS CHANGE
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <HiTrash className="w-3.5 h-3.5" /> DELETE
          </span>
        );
      case "PERMISSION_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <HiShieldCheck className="w-3.5 h-3.5" /> PERMISSIONS
          </span>
        );
      case "LOGIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            🔑 LOGIN SUCCESS
          </span>
        );
      case "LOGIN_FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            ⚠️ LOGIN FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action}
          </span>
        );
    }
  };

  const modules = ["ALL", "Visitors", "Workers", "Letters", "Inward Letters", "Event Requests", "Permissions", "Admin Auth"];

  return (
    <>
      <Head>
        <title>Project System Audit Logs - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
              📋
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">System Operations Audit Logs</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete real-time audit trail of all project activities (Create, Update, Status, Delete)
              </p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <HiRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Logs
          </button>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
              📊
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Operations</p>
              <p className="text-xl font-bold text-slate-800">{stats.total || total}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
              ✨
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Created Records</p>
              <p className="text-xl font-bold text-emerald-600">{stats.createCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
              🔄
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Updates & Statuses</p>
              <p className="text-xl font-bold text-blue-600">{stats.updateCount + stats.statusCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
              🗑️
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Deletions</p>
              <p className="text-xl font-bold text-red-600">{stats.deleteCount}</p>
            </div>
          </div>
        </div>

        {/* Module Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {modules.map((mod) => (
            <button
              key={mod}
              onClick={() => {
                setModuleFilter(mod);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                moduleFilter === mod
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {mod === "ALL" ? "🌐 All Modules" : mod}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search user, item, or details..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="STATUS_CHANGE">STATUS CHANGE</option>
              <option value="DELETE">DELETE</option>
              <option value="PERMISSION_CHANGE">PERMISSIONS</option>
            </select>

            {/* Sort Order */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-56">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-slate-400">
              <span className="text-3xl mb-2">📋</span>
              <p className="text-sm font-semibold text-slate-700">No system audit logs found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-orange-50/60 border-b border-orange-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Module</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Performed By</th>
                    <th className="px-4 py-3.5">Target Item / ID</th>
                    <th className="px-4 py-3.5">Details & Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const dateObj = log.createdAt ? new Date(log.createdAt) : null;
                    const dateStr = dateObj ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                    const timeStr = dateObj ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

                    return (
                      <tr key={log._id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{dateStr}</p>
                          <p className="text-[11px] text-slate-400">{timeStr}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <HiCube className="w-3.5 h-3.5 text-orange-500" />
                            {log.module}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {getActionBadge(log.action)}
                        </td>

                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">
                              👤
                            </div>
                            <span>{log.performedBy || "Admin"}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-xs">
                          <p className="font-bold text-slate-800 truncate max-w-[180px]" title={log.targetName || log.targetId}>
                            {log.targetName || "System Entity"}
                          </p>
                          {log.targetId && (
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                              ID: {log.targetId}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600 leading-relaxed max-w-md">
                          {log.details || "No extra details recorded"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-slate-500 text-xs font-medium">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} operations
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-semibold flex items-center gap-1"
              >
                <HiChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    p === page
                      ? "bg-slate-800 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-semibold flex items-center gap-1"
              >
                Next <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
