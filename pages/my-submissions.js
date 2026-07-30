import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiCheckCircle, HiClock, HiExclamation, HiXCircle, HiSearch, HiFilter, HiEye } from "react-icons/hi";

const PURPOSES = [
  { value: "MEET WITH DADA", label: "MEET WITH DADA" },
  { value: "ROAD", label: "ROAD" },
  { value: "FOOTPATH", label: "FOOTPATH" },
  { value: "DRAINAGE", label: "DRAINAGE" },
  { value: "WATER", label: "WATER" },
  { value: "STORM WATER CRISIS", label: "STORM WATER CRISIS" },
  { value: "WASTE MANAGEMENT", label: "WASTE MANAGEMENT" },
  { value: "FOLLIAGE MANAGEMENT", label: "FOLLIAGE MANAGEMENT" },
  { value: "DEBRIS MANAGEMENT", label: "DEBRIS MANAGEMENT" },
  { value: "TREE CUTTING", label: "TREE CUTTING" },
  { value: "STREET LIGHTS", label: "STREET LIGHTS" },
  { value: "DEATH INTIMATION LETTER", label: "DEATH INTIMATION LETTER" },
  { value: "JOB REFERENCE LETTER", label: "JOB REFERENCE LETTER" },
  { value: "MSEB", label: "MSEB" },
  { value: "BIRTH & DEATH CERTIFICATE CORRECTION", label: "BIRTH & DEATH CERTIFICATE CORRECTION" },
  { value: "RECOMONDATION LETTER", label: "RECOMONDATION LETTER" },
  { value: "ADMISSION LETTER", label: "ADMISSION LETTER" },
  { value: "TOILET", label: "TOILET" },
  { value: "MEDICAL ASSIT.", label: "MEDICAL ASSIT." },
  { value: "AMBULANCE", label: "AMBULANCE" },
  { value: "RATION KIT", label: "RATION KIT" },
  { value: "MONITERY HELP", label: "MONITERY HELP" },
  { value: "CHAIRTY", label: "CHAIRTY" },
  { value: "IN KIND HELP", label: "IN KIND HELP" },
  { value: "TANKER", label: "TANKER" },
  { value: "SCHOOL / COLLEGE FEE LETTER", label: "SCHOOL / COLLEGE FEE LETTER" },
  { value: "OTHER", label: "OTHER" }
];

const purposeColors = {
  medical:        "bg-red-50 text-red-600 border-red-200",
  education:      "bg-blue-50 text-blue-600 border-blue-200",
  job:            "bg-green-50 text-green-600 border-green-200",
  schemes:        "bg-purple-50 text-purple-600 border-purple-200",
  business:       "bg-amber-50 text-amber-600 border-amber-200",
  utility:        "bg-cyan-50 text-cyan-600 border-cyan-200",
  police:         "bg-slate-50 text-slate-600 border-slate-200",
  administrative: "bg-orange-50 text-orange-600 border-orange-200",
};

const purposeLabels = {
  medical: "Medical Assistance",
  education: "Education",
  job: "Job",
  schemes: "Government Schemes",
  business: "Business",
  utility: "Utility Service",
  police: "Police Complaint/Application",
  administrative: "Administrative Work"
};

const statusStyles = {
  "Pending": {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <HiClock className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    label: "Pending"
  },
  "In Progress": {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <HiClock className="w-4 h-4 text-blue-500 flex-shrink-0 animate-pulse" />,
    label: "In Progress"
  },
  "Closing Request": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <HiClock className="w-4 h-4 text-purple-500 flex-shrink-0 animate-pulse" />,
    label: "Closing Request"
  },
  "Completed": {
    bg: "bg-green-50 text-green-700 border-green-200",
    icon: <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
    label: "Completed"
  },
  "Rejected": {
    bg: "bg-red-50 text-red-700 border-red-200",
    icon: <HiXCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
    label: "Rejected"
  }
};

/* ─── Detail Modal ─────────────────────────────────────────── */
const DetailModal = ({ visitor, onClose, onUpdateVisitor }) => {
  if (!visitor) return null;

  const [afterImages, setAfterImages] = useState(visitor.afterImages || []);
  const [newAfterImages, setNewAfterImages] = useState([]);
  const [submittingAfter, setSubmittingAfter] = useState(false);

  const beforeImagesList = (visitor.beforeImages && visitor.beforeImages.length > 0)
    ? visitor.beforeImages
    : (visitor.photos ? [visitor.photos] : []);

  const processGeotagImage = (dataUrl, currentAddress = "") => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const applyWatermark = (lat, lng) => {
          const width = canvas.width;
          const height = canvas.height;
          const bannerHeight = Math.max(65, Math.round(height * 0.16));

          const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
          gradient.addColorStop(0, "rgba(15, 23, 42, 0.85)");
          gradient.addColorStop(1, "rgba(15, 23, 42, 0.95)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

          ctx.fillStyle = "#F97316";
          ctx.fillRect(0, height - bannerHeight, Math.max(6, Math.round(width * 0.01)), bannerHeight);

          const fontSize = Math.max(12, Math.round(bannerHeight * 0.22));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = "#FFFFFF";

          const now = new Date();
          const timeStr = now.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });

          const line1 = lat && lng 
            ? `📍 LAT: ${Number(lat).toFixed(6)}°  |  LON: ${Number(lng).toFixed(6)}°`
            : `📍 GEOTAG RECORDED`;
          const line2 = `📅 DATE: ${timeStr}`;
          const line3 = currentAddress ? `🏠 LOC: ${currentAddress.slice(0, 55)}` : "";

          const paddingLeft = Math.max(14, Math.round(width * 0.03));
          let startY = height - bannerHeight + Math.round(bannerHeight * 0.3);
          const lineGap = Math.round(bannerHeight * 0.28);

          ctx.fillText(line1, paddingLeft, startY);
          ctx.fillText(line2, paddingLeft, startY + lineGap);
          if (line3) {
            ctx.fillStyle = "#FDBA74";
            ctx.fillText(line3, paddingLeft, startY + lineGap * 2);
          }

          resolve(canvas.toDataURL("image/jpeg", 0.92));
        };

        if (typeof window !== "undefined" && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => applyWatermark(pos.coords.latitude, pos.coords.longitude),
            () => applyWatermark(null, null),
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
          );
        } else {
          applyWatermark(null, null);
        }
      };
      img.src = dataUrl;
    });
  };

  const handleAfterImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const geotagged = await processGeotagImage(reader.result, visitor.address || "");
        setNewAfterImages((prev) => [...prev, geotagged]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewAfterImage = (index) => {
    setNewAfterImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitClosingRequest = async () => {
    const combinedAfter = [...afterImages, ...newAfterImages];
    if (combinedAfter.length === 0) {
      toast.warning("Please upload at least one After Image before submitting Closing Request.");
      return;
    }

    setSubmittingAfter(true);
    try {
      const res = await fetch(`/api/update-visitor/${visitor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          afterImages: combinedAfter,
          status: "Closing Request",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("After Images submitted! Status changed to Closing Request.");
        if (onUpdateVisitor) onUpdateVisitor(data);
        onClose();
      } else {
        toast.error(data.error || "Failed to submit After Images.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting After Images.");
    } finally {
      setSubmittingAfter(false);
    }
  };

  const getStatusText = (status) => {
    return statusStyles[status]?.label || status || "Pending";
  };

  const getGenderText = (sex) => {
    if (sex === "male") return "Male";
    if (sex === "female") return "Female";
    if (sex === "other") return "Other";
    return sex || "—";
  };

  const combinedAddress = visitor.address || [
    visitor.houseNo,
    visitor.landmark,
    visitor.village,
    visitor.pincode ? String(visitor.pincode) : ""
  ].filter((val) => val && val.trim() !== "").join(", ");

  const displayPurpose = visitor.purpose === "Other" && visitor.customPurpose ? visitor.customPurpose : visitor.purpose;
  const displaySubPurpose = visitor.purpose === "DRAINAGE" && visitor.subPurpose === "Other" && visitor.customPurpose ? visitor.customPurpose : visitor.subPurpose;

  const fields = [
    ["Name", visitor.fullName],
    ["Phone Number", visitor.phoneNo],
    ["Gender", getGenderText(visitor.sex)],
    ["Address", combinedAddress],
    ["Nature of Work", displayPurpose],
    ...(visitor.purpose === "DRAINAGE" && displaySubPurpose ? [["Drainage Sub-Type", displaySubPurpose]] : []),
    ["Status", getStatusText(visitor.status)],
    ["Registered On", visitor.createdAt ? new Date(visitor.createdAt).toLocaleString("en-IN") : "—"],
  ].filter(([, value]) => value);

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
              {visitor.photos ? (
                <img
                  src={visitor.photos}
                  alt={visitor.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
                  {visitor.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {visitor.fullName}
                </h2>
                <span className={`inline-flex mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold border bg-orange-50 text-orange-700 border-orange-200`}>
                  {visitor.purpose === "Other" && visitor.customPurpose ? visitor.customPurpose : visitor.purpose}
                  {visitor.purpose === "DRAINAGE" && visitor.subPurpose ? ` - ${visitor.subPurpose === "Other" && visitor.customPurpose ? visitor.customPurpose : visitor.subPurpose}` : ""}
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
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Status Highlight */}
            <div className={`p-4 rounded-2xl border ${statusStyles[visitor.status || "Pending"]?.bg} flex items-start gap-3`}>
              {statusStyles[visitor.status || "Pending"]?.icon}
              <div>
                <h4 className="font-bold text-sm">Application Status</h4>
                <p className="text-sm mt-0.5 font-semibold">
                  {statusStyles[visitor.status || "Pending"]?.label}
                </p>
                {visitor.followUp ? (
                  <div className="mt-2.5 pt-2 border-t border-current/20">
                    <p className="text-xs opacity-75 font-semibold">Update Remarks / Follow-up:</p>
                    <p className="text-sm font-medium mt-0.5 break-words whitespace-pre-line">{visitor.followUp}</p>
                  </div>
                ) : (
                  <p className="text-xs opacity-75 mt-1.5 font-medium">No follow-up remarks available.</p>
                )}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Submission Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(([label, value]) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-1 font-semibold">{label}</p>
                    <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents / Before Images */}
            {beforeImagesList.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Documents / Before Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {beforeImagesList.map((imgUrl, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      <img src={imgUrl} alt={`Before ${i+1}`} className="w-full h-28 object-cover" />
                      <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                        📍 Geotagged
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* After Images Upload & Closing Request Section */}
            <div className="bg-orange-50/40 border border-orange-200/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">After Work / Completion Images</h4>
                  <p className="text-xs text-slate-500">Upload geotagged images showing completed work to submit a Closing Request to Admin.</p>
                </div>
                {visitor.status === "Closing Request" && (
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                    Closing Request Sent
                  </span>
                )}
              </div>

              {/* Grid of uploaded/existing After Images */}
              {([...afterImages, ...newAfterImages]).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {afterImages.map((imgUrl, i) => (
                    <div key={`existing-${i}`} className="relative rounded-xl overflow-hidden border border-purple-200 bg-slate-900">
                      <img src={imgUrl} alt={`After ${i+1}`} className="w-full h-28 object-cover" />
                      <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                        📍 Geotagged
                      </div>
                    </div>
                  ))}
                  {newAfterImages.map((imgUrl, i) => (
                    <div key={`new-${i}`} className="relative rounded-xl overflow-hidden border border-purple-300 bg-slate-900">
                      <img src={imgUrl} alt={`New After ${i+1}`} className="w-full h-28 object-cover" />
                      <div className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                        📍 Geotagged
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewAfterImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Input & Submit Closing Request Button */}
              {visitor.status !== "Completed" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    id="file-after-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAfterImagesChange}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("file-after-images").click()}
                    className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    📷 Upload After Images
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitClosingRequest}
                    disabled={submittingAfter}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    {submittingAfter ? "Submitting..." : "Submit Closing Request"}
                  </button>
                </div>
              )}
            </div>

            {/* Message/Notes */}
            {visitor.message && (
              <div className="bg-orange-50/20 border border-orange-100/50 rounded-2xl p-4">
                <h4 className="text-xs text-slate-500 font-bold mb-1">Additional Message / Remarks</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{visitor.message}</p>
              </div>
            )}
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

/* ─── Main Submissions Listing ──────────────────────────────── */
export default function MySubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sort, setSort] = useState("newest");
  const limit = 9;

  const [selectedVisitor, setSelectedVisitor] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    if (!role || !username) {
      router.push("/login");
    }
  }, [router]);

  const fetchSubmissions = useCallback(async () => {
    const username = localStorage.getItem("username") || "";
    if (!username) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        purpose,
        sort,
        addedBy: username
      });
      const res = await fetch(`/api/visitors?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.visitors);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.error || "Error fetching submissions list.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }, [page, search, purpose, sort]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset to page 1 when filter values change
  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handlePurpose = (val) => { setPurpose(val); setPage(1); };
  const handleSort = (val) => { setSort(val); setPage(1); };

  const getStatusBadge = (status) => {
    const style = statusStyles[status] || statusStyles["Pending"];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
        {style.icon}
        {style.label}
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>My Entry's – Punit Joshi</title>
        <meta name="description" content="Track status and progress of visitor forms submitted by you." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">My Entries</h1>
          <p className="text-slate-500 text-sm mt-1">
            View details, current status, and follow-up remarks of visitors registered by you.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search by name, phone or village..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 text-sm transition-all"
            />
          </div>

          {/* Purpose dropdown */}
          <select
            value={purpose}
            onChange={(e) => handlePurpose(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-700 text-sm transition-all outline-none"
          >
            <option value="">All Purposes</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500/20 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-700 text-sm transition-all outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-500 text-2xl">
              📝
            </div>
            <h3 className="font-bold text-slate-800">No records found</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              No applications have been submitted by you yet, or no results were found. Go to 'Register' to submit a new application.
            </p>
            <button
              onClick={() => router.push("/form")}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all text-xs font-bold shadow-md shadow-orange-500/10 inline-block"
            >
              Register New Visitor
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-orange-50/60 border-b border-orange-100">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor Name</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nature of Work</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">After Work / Completion Images</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Closing Request Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((v) => (
                    <tr
                      key={v._id}
                      onClick={() => setSelectedVisitor(v)}
                      className="hover:bg-orange-50/20 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {v.photos ? (
                            <img
                              src={v.photos}
                              alt={v.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-orange-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {v.fullName?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{v.fullName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{v.phoneNo || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-600">
                          {v.purpose}
                          {v.purpose === "DRAINAGE" && v.subPurpose ? ` - ${v.subPurpose}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(v.status)}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {v.afterImages && v.afterImages.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-purple-200 bg-slate-900 flex-shrink-0">
                              <img src={v.afterImages[0]} alt="After Work" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {v.afterImages.length} Image{v.afterImages.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No images uploaded</span>
                        )}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {v.status === "Completed" ? (
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            Completed
                          </span>
                        ) : v.status === "Closing Request" ? (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            Closing Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedVisitor(v)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>📷 Upload & Submit Closing</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-slate-500 text-xs">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} applications
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
              >
                Prev
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
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVisitor && (
        <DetailModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
          onUpdateVisitor={(updated) => {
            setSelectedVisitor(updated);
            setSubmissions((prev) =>
              prev.map((sub) => (sub._id === updated._id ? updated : sub))
            );
          }}
        />
      )}
    </>
  );
}
