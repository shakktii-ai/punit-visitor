import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const PURPOSES = ["medical", "education", "job", "schemes", "business", "utility", "police", "administrative"];

const purposeColors = {
  medical:        "bg-red-100 text-red-600 border-red-200",
  education:      "bg-blue-100 text-blue-600 border-blue-200",
  job:            "bg-green-100 text-green-600 border-green-200",
  schemes:        "bg-purple-100 text-purple-600 border-purple-200",
  business:       "bg-amber-100 text-amber-600 border-amber-200",
  utility:        "bg-cyan-100 text-cyan-600 border-cyan-200",
  police:         "bg-slate-100 text-slate-600 border-slate-200",
  administrative: "bg-orange-100 text-orange-600 border-orange-200",
};

/* ─── Detail Modal ─────────────────────────────────────────── */
// const DetailModal = ({ visitor, onClose }) => {
//   if (!visitor) return null;

//   const fields = [
//     ["Full Name", visitor.fullName],
//     ["Email", visitor.email],
//     ["Phone", visitor.phoneNo],
//     ["Age", visitor.age],
//     ["Gender", visitor.sex],
//     ["Date of Birth", visitor.DOB ? new Date(visitor.DOB).toLocaleDateString() : "—"],
//     ["Aadhar / Voter ID", visitor.aadharVoter],
//     ["House No.", visitor.houseNo],
//     ["Landmark", visitor.landmark],
//     ["Village / Town", visitor.village],
//     ["State", visitor.state],
//     ["Nation", visitor.nation],
//     ["Pincode", visitor.pincode],
//     ["Purpose", visitor.purpose],
//     // Purpose-specific
//     ["Patient Name", visitor.patiantName],
//     ["Hospital", visitor.hospitalName],
//     ["Doctor", visitor.trackingDoctor],
//     ["Reason", visitor.reason],
//     ["Student Name", visitor.studentName],
//     ["Student DOB", visitor.studentDOB ? new Date(visitor.studentDOB).toLocaleDateString() : null],
//     ["Student Gender", visitor.studentGender],
//     ["Student Category", visitor.studentCategory],
//     ["Job Full Name", visitor.jobFullName],
//     ["Position Applied", visitor.jobPosition],
//     ["Job Department", visitor.jobDepartment],
//     ["Preferred Location", visitor.jobLocation],
//     ["Expected Salary", visitor.jobSalary],
//     ["Employee Name", visitor.employeeName],
//     ["Employee ID", visitor.employeeId],
//     ["Emp. Department", visitor.employeeDepartment],
//     ["Designation", visitor.employeeDesignation],
//     ["Req. Department", visitor.employeeRDepartment],
//     ["Req. Transfer", visitor.employeeRTransfer],
//     ["Scheme Name", visitor.schemeName],
//     ["Prev. Application", visitor.schemePApplication],
//     ["Apply Date", visitor.schemeApplyDate ? new Date(visitor.schemeApplyDate).toLocaleDateString() : null],
//     ["Marital Status", visitor.schemeMaritalStatus],
//     ["Scheme Category", visitor.schemeCategary],
//     ["Scheme Aadhar", visitor.schemeAddhar],
//     ["Business Name", visitor.businessName],
//     ["Business Type", visitor.businessType],
//     ["Business Sector", visitor.businessSector],
//     ["Registration No.", visitor.businessRNo],
//     ["Date of Est.", visitor.businessDOE ? new Date(visitor.businessDOE).toLocaleDateString() : null],
//     ["GST No.", visitor.businessGST],
//     ["Business Address", visitor.businessAddress],
//     ["Utility Service", visitor.utilityServiceInstallation],
//     ["Utility Problem", visitor.utilityProblem],
//     ["Police App. No.", visitor.policeApplicationNo],
//     ["Police App. Date", visitor.policeApplicationDate ? new Date(visitor.policeApplicationDate).toLocaleDateString() : null],
//     ["App. Place", visitor.policeApplicationPlace],
//     ["Incident Details", visitor.policeIncidentDetails],
//     ["Involved Person", visitor.policeInvolveName],
//     ["Declaration", visitor.policeDeclaration],
//     ["Project Name", visitor.projectName],
//     ["Project Location", visitor.projectLocation],
//     ["Project Problem", visitor.projectProblem],
//     ["Message", visitor.message],
//     ["Registered On", visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : "—"],
//   ].filter(([, v]) => v !== null && v !== undefined && v !== "");

//   return (
   
//   <div
//     className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm overflow-y-auto"
//     onClick={onClose}
//   >
//     <div className="min-h-screen flex items-start justify-center p-4 pt-8">
//       <div
//         className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {visitor.photos ? (
//               <img
//                 src={visitor.photos}
//                 alt={visitor.fullName}
//                 className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
//               />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold">
//                 {visitor.fullName?.[0]?.toUpperCase() || "?"}
//               </div>
//             )}

//             <div>
//               <h2 className="text-lg font-bold text-slate-800">
//                 {visitor.fullName}
//               </h2>

//               <span
//                 className={`inline-flex mt-1 text-xs px-2 py-1 rounded-full font-medium capitalize border ${
//                   purposeColors[visitor.purpose] ||
//                   "bg-gray-100 text-gray-600 border-gray-200"
//                 }`}
//               >
//                 {visitor.purpose || "—"}
//               </span>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
//           >
//             <svg
//               className="w-5 h-5 text-slate-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="overflow-y-auto p-6 max-h-[calc(90vh-80px)]">
//           {/* Photo */}
//           {visitor.photos && (
//             <div className="px-6 pt-6 flex justify-center">
//               <img
//                 src={visitor.photos}
//                 alt={visitor.fullName}
//                 className="w-32 h-32 rounded-2xl object-cover border-2 border-orange-100 shadow-md"
//               />
//             </div>
//           )}

//           {/* Fields */}
//           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//             {fields.map(([label, value]) => (
//               <div
//                 key={label}
//                 className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
//               >
//                 <p className="text-xs text-slate-400 mb-1">{label}</p>
//                 <p className="text-sm font-medium text-slate-800 break-words">
//                   {value}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex justify-end">
//             <button
//               onClick={onClose}
//               className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>

//   );
// };

const DetailModal = ({ visitor, onClose }) => {
  if (!visitor) return null;

  const fields = [
    ["Full Name", visitor.fullName],
    ["Email", visitor.email],
    ["Phone", visitor.phoneNo],
    ["Age", visitor.age],
    ["Gender", visitor.sex],
    ["Date of Birth", visitor.DOB ? new Date(visitor.DOB).toLocaleDateString() : "—"],
    ["Aadhar / Voter ID", visitor.aadharVoter],
    ["House No.", visitor.houseNo],
    ["Landmark", visitor.landmark],
    ["Village / Town", visitor.village],
    ["Pincode", visitor.pincode],
    ["Purpose", visitor.purpose],
    ["Registered By", visitor.addedBy],
    ["Status", visitor.status || "Pending"],
    ["Follow-up Details", visitor.followUp || "—"],
    ["Registered On", visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : "—"],
  ].filter(([, value]) => value);

  return (
    <div
      className="fixed top-24 left-64   p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center py-8">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              {visitor.photos ? (
                <img
                  src={visitor.photos}
                  alt={visitor.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  {visitor.fullName?.charAt(0)}
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {visitor.fullName}
                </h2>

                <span className="inline-flex mt-1 px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                  {visitor.purpose}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Photo */}
          {visitor.photos && (
            <div className="flex justify-center py-6">
              <img
                src={visitor.photos}
                alt={visitor.fullName}
                className="w-32 h-32 rounded-2xl object-cover shadow-lg border"
              />
            </div>
          )}

          {/* Fields */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-slate-800 font-medium break-words">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
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
const ConfirmModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50  backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
      <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-2">Delete Visitor?</h3>
      <p className="text-slate-500 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-slate-700">{name}</span>? This cannot be undone.
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
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Page ────────────────────────────────────────────── */
export default function VisitorTable() {
  const router = useRouter();

  const [visitors, setVisitors]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]     = useState("");
  const [purpose, setPurpose]   = useState("");
  const [sort, setSort]         = useState("newest");
  const limit = 10;

  const [selectedVisitor, setSelectedVisitor]   = useState(null);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [deleting, setDeleting]                 = useState(false);

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
      const params = new URLSearchParams({ page, limit, search, purpose, sort });
      const res = await fetch(`/api/visitors?${params}`);
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch visitors.");
    } finally {
      setLoading(false);
    }
  }, [page, search, purpose, sort]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Reset to page 1 when filters change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePurpose = (val) => { setPurpose(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/visitors?id=${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Visitor deleted successfully.");
        setDeleteTarget(null);
        fetchVisitors();
      } else {
        toast.error(data.error || "Failed to delete.");
      }
    } catch {
      toast.error("Error deleting visitor.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Visitor Manager – VisitorPass Admin</title>
        <meta name="description" content="Manage and view all registered visitors." />
      </Head>

      
      <div className="p-6 md:p-8 space-y-6">
       

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Visitor Manager</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {total} visitor{total !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={fetchVisitors}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors self-start sm:self-auto"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, email, village..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
          </div>

          {/* Purpose Filter */}
          <select
            value={purpose}
            onChange={(e) => handlePurpose(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
            <option value="">All Purposes</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-visible">
          
           {selectedVisitor && <DetailModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />}
      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.fullName}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">No visitors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-50/60 border-b border-orange-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">#</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Visitor</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Contact</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Purpose</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visitors.map((v, idx) => (
                    <tr key={v._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {v.photos ? (
                            <img src={v.photos} alt={v.fullName} className="w-8 h-8 rounded-full object-cover border border-orange-100 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {v.fullName?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-slate-800 font-medium">{v.fullName}</p>
                            <p className="text-slate-400 text-xs">{v.age ? `${v.age} yrs` : ""} {v.sex ? `· ${v.sex}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{v.phoneNo}</p>
                        <p className="text-slate-400 text-xs truncate max-w-[140px]">{v.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{v.village}</p>
                        <p className="text-slate-400 text-xs">{v.pincode || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${purposeColors[v.purpose] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {v.purpose || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const status = v.status || "Pending";
                          let color = "bg-amber-100 text-amber-700 border-amber-200";
                          if (status === "In Progress") color = "bg-blue-100 text-blue-700 border-blue-200";
                          if (status === "Completed") color = "bg-green-100 text-green-700 border-green-200";
                          if (status === "Rejected") color = "bg-red-100 text-red-700 border-red-200";
                          return (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${color}`}>
                              {status}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedVisitor(v)}
                            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/edit-visitor/${v._id}`)}
                            className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors"
                            title="Edit visitor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete visitor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
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
