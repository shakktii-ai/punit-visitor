import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import { HiSearch, HiTrash, HiEye, HiUserAdd, HiRefresh, HiPencil } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";

const POSITIONS = [
  "Booth Head",
  "Shakti Kendra Head",
  "Mandal President",
  "Mandal General Secretary",
  "City Vice President",
  "District Executive Member",
  "Worker",
];

const positionTranslation = {
  "बूथ प्रमुख": "Booth Head",
  "शक्ती केंद्र प्रमुख": "Shakti Kendra Head",
  "मंडळ अध्यक्ष": "Mandal President",
  "मंडळ सरचिटणीस": "Mandal General Secretary",
  "शहर उपाध्यक्ष": "City Vice President",
  "जिल्हा कार्यकारिणी सदस्य": "District Executive Member",
  "कार्यकर्ता": "Worker",
  "Booth Head": "Booth Head",
  "Shakti Kendra Head": "Shakti Kendra Head",
  "Mandal President": "Mandal President",
  "Mandal General Secretary": "Mandal General Secretary",
  "City Vice President": "City Vice President",
  "District Executive Member": "District Executive Member",
  "Worker": "Worker",
};

const positionColors = {
  "Booth Head": "bg-blue-50 text-blue-700 border-blue-200",
  "Shakti Kendra Head": "bg-purple-50 text-purple-700 border-purple-200",
  "Mandal President": "bg-red-50 text-red-700 border-red-200",
  "Mandal General Secretary": "bg-amber-50 text-amber-700 border-amber-200",
  "City Vice President": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "District Executive Member": "bg-slate-50 text-slate-700 border-slate-200",
  "Worker": "bg-green-50 text-green-700 border-green-200",
};

const getPositionText = (pos) => positionTranslation[pos] || pos;
const getPositionColor = (pos) => positionColors[positionTranslation[pos] || pos] || "bg-gray-100 text-gray-600 border-gray-200";

const maritalStatusTranslation = {
  "अविवाहित": "Single",
  "विवाहित": "Married",
  "घटस्फोटित": "Divorced",
  "विधुर / विधवा": "Widowed",
  "Single": "Single",
  "Married": "Married",
  "Divorced": "Divorced",
  "Widowed": "Widowed",
};

const getMaritalStatusText = (status) => maritalStatusTranslation[status] || status;

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ worker, onClose }) => {
  if (!worker) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const sections = [
    {
      title: "1. Personal Info",
      fields: [
        ["Full Name", `${worker.firstName} ${worker.middleName || ""} ${worker.lastName}`],
        ["Date of Birth (DOB)", formatDate(worker.DOB)],
        ["Marital Status", getMaritalStatusText(worker.maritalStatus) || "—"],
      ]
    },
    {
      title: "2. Address & Contacts",
      fields: [
        ["Primary Mobile", worker.primaryPhone],
        ["Alternative Mobile", worker.alternativePhone || "—"],
        ["House No", worker.houseNo || "—"],
        ["Street", worker.street || "—"],
        ["Village / City", worker.village || "—"],
        ["Taluka", worker.taluka || "—"],
        ["District", worker.district || "—"],
        ["Pincode", worker.pincode || "—"],
      ]
    },
    {
      title: "3. Position & Area",
      fields: [
        ["Position", getPositionText(worker.position)],
        ["Area / Booth No.", worker.areaNameOrBooth || "—"],
      ]
    },
    {
      title: "4. Family Details",
      fields: [
        ["Spouse Name", worker.spouseName || "—"],
        ["Spouse DOB", formatDate(worker.spouseDOB)],
        ["Anniversary Date", formatDate(worker.anniversaryDate)],
        ["Father Name", worker.fatherName || "—"],
        ["Father DOB", formatDate(worker.fatherDOB)],
        ["Mother Name", worker.motherName || "—"],
        ["Mother DOB", formatDate(worker.motherDOB)],
        ["Parents Anniversary Date", formatDate(worker.parentsAnniversaryDate)],
      ]
    },
    {
      title: "5. Registration Info",
      fields: [
        ["Created By", worker.createdBy === "admin" ? "Admin" : `User (${worker.addedBy || "—"})`],
        ["Registered On", worker.createdAt ? new Date(worker.createdAt).toLocaleString("en-US") : "—"],
      ]
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-10">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-orange-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {worker.photo ? (
                <img
                  src={worker.photo}
                  alt={`${worker.firstName} ${worker.lastName}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                  {worker.firstName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">
                  {worker.firstName} {worker.lastName}
                </h2>
                <span className={`inline-flex mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${getPositionColor(worker.position)}`}>
                  {getPositionText(worker.position)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors text-xl font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b border-orange-50 pb-1">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {section.fields.map(([label, value]) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 mb-1 font-semibold">{label}</p>
                      <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors text-sm font-semibold shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Confirm Delete Modal ─────────────────────────────────── */
const ConfirmModal = ({ worker, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-orange-100">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
        ⚠️
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-2">Delete Worker?</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Are you sure you want to delete the registration of <span className="font-semibold text-slate-700">{worker.firstName} {worker.lastName}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Workers Manager Page ────────────────────────────── */
export default function WorkersList() {
  const router = useRouter();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 10;

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, position, sort });
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/workers?${params}`, {
        headers: {
          "x-user-role": "admin",
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkers(data.workers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Error fetching workers list.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, position, sort]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePosition = (val) => { setPosition(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/workers?id=${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": "admin",
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Worker registration deleted successfully.");
        setDeleteTarget(null);
        fetchWorkers();
      } else {
        toast.error(data.error || "Failed to delete.");
      }
    } catch {
      toast.error("Error occurred while deleting.");
    }
  };

  return (
    <>
      <Head>
        <title>Workers List – VisitorPass Admin</title>
        <meta name="description" content="Manage and view all registered workers." />
      </Head>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Workers List</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Total {total} workers registered
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={fetchWorkers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <HiRefresh className="w-4.5 h-4.5" />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin/addWorker")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
            >
              <HiUserAdd className="w-4.5 h-4.5" />
              New Worker
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, village or position..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Position filter */}
          <select
            value={position}
            onChange={(e) => handlePosition(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
          >
            <option value="">All Positions</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <span className="text-3xl mb-2">👥</span>
              <p className="text-sm">No workers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-50/60 border-b border-orange-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">#</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Name</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Contact</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Village / Booth</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Position</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Registered By</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Registered On</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {workers.map((w, idx) => (
                    <tr key={w._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          {w.photo ? (
                            <img src={w.photo} alt={w.firstName} className="w-8 h-8 rounded-full object-cover border border-slate-100 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] flex-shrink-0">
                              {w.firstName?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span>{w.firstName} {w.middleName || ""} {w.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="text-slate-700 font-medium">{w.primaryPhone}</p>
                        {w.alternativePhone && (
                          <p className="text-slate-400 text-xs">Alt: {w.alternativePhone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="text-slate-700">{w.village || "—"}</p>
                        {w.areaNameOrBooth && (
                          <p className="text-slate-400 text-xs">{w.areaNameOrBooth}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getPositionColor(w.position)}`}>
                          {getPositionText(w.position)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.createdBy === "admin" ? "bg-orange-50 text-orange-700 border border-orange-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                          {w.createdBy === "admin" ? "Admin" : w.addedBy || "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString("en-US") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedWorker(w)}
                            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors"
                            title="View Details"
                          >
                            <HiEye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/edit-worker/${w._id}`)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                            title="Edit Details"
                          >
                            <HiPencil className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(w)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} workers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    p === page
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <DetailModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          worker={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
