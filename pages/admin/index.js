import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`bg-white rounded-2xl border ${color} p-5 shadow-sm flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color.replace("border-", "bg-").replace("-200", "-100")}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
      <p className="text-slate-800 text-2xl font-bold">{value ?? "—"}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const purposeColors = {
    medical:       "bg-red-100 text-red-600",
    education:     "bg-blue-100 text-blue-600",
    job:           "bg-green-100 text-green-600",
    schemes:       "bg-purple-100 text-purple-600",
    business:      "bg-amber-100 text-amber-600",
    utility:       "bg-cyan-100 text-cyan-600",
    police:        "bg-slate-100 text-slate-600",
    administrative:"bg-orange-100 text-orange-600",
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard – VisitorPass</title>
        <meta name="description" content="Admin dashboard for VisitorPass visitor management system." />
      </Head>

      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Welcome back, Admin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              href="/admin/visitorTable"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Visitors
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Visitors" value={stats?.totalVisitors} icon="👥" color="border-orange-200" sub="All time" />
              <StatCard label="Today's Visitors" value={stats?.todayVisitors} icon="📅" color="border-blue-200" sub="Registered today" />
              <StatCard label="Purposes Tracked" value={stats?.purposeBreakdown?.length} icon="📋" color="border-green-200" sub="Unique categories" />
              <StatCard
                label="Most Common Purpose"
                value={stats?.purposeBreakdown?.[0]?._id
                  ? stats.purposeBreakdown[0]._id.charAt(0).toUpperCase() + stats.purposeBreakdown[0]._id.slice(1)
                  : "—"}
                icon="🏆"
                color="border-purple-200"
                sub={stats?.purposeBreakdown?.[0] ? `${stats.purposeBreakdown[0].count} visitors` : ""}
              />
            </div>

            {/* Purpose Breakdown & Recent Visitors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Purpose Breakdown */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
                <h2 className="text-slate-800 font-bold text-base mb-4">Purpose Breakdown</h2>
                {stats?.purposeBreakdown?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.purposeBreakdown.map((p) => {
                      const pct = Math.round((p.count / stats.totalVisitors) * 100);
                      return (
                        <div key={p._id}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${purposeColors[p._id] || "bg-gray-100 text-gray-600"}`}>
                              {p._id || "Unknown"}
                            </span>
                            <span className="text-slate-500 text-xs">{p.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-amber-400 h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No data available</p>
                )}
              </div>

              {/* Recent Visitors */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-800 font-bold text-base">Recent Visitors</h2>
                  <Link href="/admin/visitorTable" className="text-orange-500 text-xs font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                {stats?.recentVisitors?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentVisitors.map((v) => (
                      <div key={v._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                        {v.photos ? (
                          <img src={v.photos} alt={v.fullName} className="w-9 h-9 rounded-full object-cover border border-orange-100 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {v.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 text-sm font-medium truncate">{v.fullName}</p>
                          <p className="text-slate-400 text-xs">{v.phoneNo} · {v.village}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${purposeColors[v.purpose] || "bg-gray-100 text-gray-600"}`}>
                          {v.purpose || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No visitors yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
