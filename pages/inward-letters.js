import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiSearch, HiTrash, HiEye, HiPlus, HiRefresh, HiPencil } from "react-icons/hi";

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ letter, onClose }) => {
  if (!letter) return null;

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
      title: "1. Core Details",
      fields: [
        ["Subject", letter.subject],
        ["Inward Number", letter.inwardNumber],
        ["Inward Date", formatDate(letter.inwardDate)],
        ["Sender Name", letter.senderName || "—"],
        ["Sender Contact", letter.senderContact || "—"],
      ]
    },
    {
      title: "2. Action & Assignment Details",
      fields: [
        ["Department", letter.department || "—"],
        ["Assigned To", letter.assignedPerson || "—"],
        ["Action Taken", letter.actionTaken || "—"],
        ["Status", letter.status || "—"],
        ["Remark", letter.remark || "—"],
      ]
    },
    {
      title: "3. Registration Info",
      fields: [
        ["Created By", letter.createdBy === "admin" ? "Admin" : `User (${letter.addedBy || "—"})`],
        ["Registered On", letter.createdAt ? new Date(letter.createdAt).toLocaleString("en-US") : "—"],
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
              {letter.photo ? (
                <img
                  src={letter.photo}
                  alt={letter.subject}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-lg">
                  ✉️
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {letter.subject}
                </h2>
                <span className="inline-flex mt-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-50 border border-slate-200 text-slate-600">
                  Inward No: {letter.inwardNumber}
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
            {letter.photo && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 border-b border-orange-50 pb-1">Document scan</h3>
                <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <a href={letter.photo} target="_blank" rel="noopener noreferrer" title="Click to view full image">
                    <img src={letter.photo} alt="Document scan preview" className="max-h-96 object-contain rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-300" />
                  </a>
                </div>
              </div>
            )}

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
const ConfirmModal = ({ letter, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-orange-100">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
        ⚠️
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-2">Delete Inward Letter?</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">
        Are you sure you want to delete the inward letter <span className="font-semibold text-slate-700">"{letter.subject}"</span>? This action cannot be undone.
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

/* ─── Main Inward Letters List Page ──────────────────────────── */
export default function InwardLettersListUser() {
  const router = useRouter();

  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 10;

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "user") {
      router.push("/login");
    } else if (!allowedPages.includes("/inward-letters")) {
      router.push("/form");
    }
  }, [router]);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem("username") || "";
      if (!username) return;

      const params = new URLSearchParams({ page, limit, search, sort });
      const res = await fetch(`/api/inward-letters?${params}`, {
        headers: {
          "x-user-role": "user",
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLetters(data.letters);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Error fetching inward letters list.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const username = localStorage.getItem("username") || "";
      const res = await fetch(`/api/inward-letters?id=${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": "user",
          "x-username": username,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Inward letter registration deleted successfully.");
        setDeleteTarget(null);
        fetchLetters();
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
        <title>Inward Letters – Punit Joshi</title>
        <meta name="description" content="View and manage inward letters you registered." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Inward Letters</h1>
            <p className="text-slate-500 text-sm mt-1">
              Total {total} inward letters registered by you are listed below.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={fetchLetters}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <HiRefresh className="w-4.5 h-4.5" />
              Refresh
            </button>
            <button
              onClick={() => router.push("/addInwardLetter")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
            >
              <HiPlus className="w-4.5 h-4.5" />
              Register Inward Letter
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
              placeholder="Search by subject, inward number, department, sender or assigned person..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 text-sm transition-all"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-700 text-sm transition-all outline-none"
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
          ) : letters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center p-8">
              <span className="text-3xl mb-2 block">📥</span>
              <p className="text-sm">No inward letters found.</p>
              <button
                onClick={() => router.push("/addInwardLetter")}
                className="mt-4 px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Register First Inward Letter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-50/60 border-b border-orange-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Image</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Inward Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Inward No.</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Subject</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Action Taken</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Department</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Assigned To</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {letters.map((l, idx) => (
                    <tr key={l._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-4 py-3">
                        {l.photo ? (
                          <img 
                            src={l.photo} 
                            alt={l.subject} 
                            className="w-10 h-10 rounded object-cover border border-slate-200 cursor-pointer" 
                            onClick={() => setSelectedLetter(l)} 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-lg font-bold">
                            ✉️
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                        {l.inwardDate ? new Date(l.inwardDate).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-bold">
                        {l.inwardNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold truncate max-w-[200px]">
                        {l.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          l.status === "Completed" 
                            ? "bg-green-50 text-green-800 border border-green-200" 
                            : l.status === "In Progress"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {l.actionTaken || l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {l.department || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {l.assignedPerson || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedLetter(l)}
                            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors"
                            title="View Details"
                          >
                            <HiEye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/edit-inward-letter/${l._id}`)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors"
                            title="Edit Details"
                          >
                            <HiPencil className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(l)}
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
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} inward letters
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
      {selectedLetter && (
        <DetailModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          letter={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
