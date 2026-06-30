import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiSearch, HiCheck, HiX, HiClock, HiExclamation, HiChevronDown, HiChevronUp, HiTrash, HiCamera, HiCloudUpload } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";

export default function AdminEventRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // "All", "Pending", "Approved", "Rejected"
  const [searchTerm, setSearchTerm] = useState("");

  // Rejection remark states
  const [rejectionReason, setRejectionReason] = useState({});
  const [showRejectFormId, setShowRejectFormId] = useState(null);
  
  // Expanded details for card view
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  // Camera state hooks
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = React.useRef(null);

  const handleAdminFileChange = (e, reqId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateImage(reqId, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImage = async (reqId, imageBase64) => {
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-username": username
        },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Invitation image updated successfully!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to update image.");
      }
    } catch {
      toast.error("Server error while updating image.");
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setActiveCameraId(null);
  }, [cameraStream]);

  const startCamera = async (reqId, mode = "user") => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setActiveCameraId(reqId);
    setFacingMode(mode);
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startCamera(activeCameraId, nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && activeCameraId) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      handleUpdateImage(activeCameraId, dataUrl);
      stopCamera();
    }
  };

  // Bind video stream once video element mounts
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeCameraId]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "admin") {
      router.push("/login");
    } else if (username !== "admin" && !allowedPages.includes("/admin/event-requests")) {
      router.push("/admin");
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const [requestsRes, workersRes, todosRes] = await Promise.all([
        fetch("/api/event-requests", {
          headers: {
            "x-username": username
          }
        }),
        fetch("/api/workers?limit=1000"),
        fetch("/api/todos")
      ]);

      const requestsData = await requestsRes.json();
      const workersData = await workersRes.json();
      const todosData = await todosRes.json();

      if (requestsRes.ok && requestsData.success) {
        setRequests(requestsData.requests);
      }
      if (workersRes.ok && workersData.success) {
        setWorkers(workersData.workers);
      }
      if (todosRes.ok && todosData.success) {
        setTodos(todosData.todos);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load request management data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveRequest = async (reqId) => {
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-username": username
        },
        body: JSON.stringify({ status: "Approved" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Event request approved!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to approve event.");
      }
    } catch {
      toast.error("Server error while processing approval.");
    }
  };

  const handleRejectRequest = async (reqId) => {
    const remark = rejectionReason[reqId] || "";
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-username": username
        },
        body: JSON.stringify({ status: "Rejected", remark }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Event request rejected.");
        setRejectionReason((prev) => ({ ...prev, [reqId]: "" }));
        setShowRejectFormId(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to reject event.");
      }
    } catch {
      toast.error("Server error while processing rejection.");
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!confirm("Are you sure you want to delete this event request permanently?")) return;
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "DELETE",
        headers: {
          "x-username": username
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Event request deleted successfully.");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete request.");
      }
    } catch {
      toast.error("Server error while deleting request.");
    }
  };

  // Helper: check if two dates are same calendar day/month/year
  const isSameDate = (dateA, dateB) => {
    if (!dateA || !dateB) return false;
    const dA = new Date(dateA);
    const dB = new Date(dateB);
    return (
      dA.getDate() === dB.getDate() &&
      dA.getMonth() === dB.getMonth() &&
      dA.getFullYear() === dB.getFullYear()
    );
  };

  // Helper: check if two dates are same day/month (birthday check)
  const isSameDayMonth = (dateA, dateB) => {
    if (!dateA || !dateB) return false;
    const dA = new Date(dateA);
    const dB = new Date(dateB);
    return dA.getDate() === dB.getDate() && dA.getMonth() === dB.getMonth();
  };

  // Compute Conflicts for a Date
  const getConflictsForDate = (dateStr, excludeId) => {
    const targetDate = new Date(dateStr);
    const conflicts = [];

    // 1. Birthdays & Anniversaries
    workers.forEach((w) => {
      if (w.DOB && isSameDayMonth(w.DOB, targetDate)) {
        conflicts.push(`🎂 ${w.firstName} ${w.lastName} (Birthday)`);
      }
      if ((w.maritalStatus === "विवाहित" || w.maritalStatus === "Married") && w.spouseName && w.spouseDOB && isSameDayMonth(w.spouseDOB, targetDate)) {
        conflicts.push(`🎂 ${w.spouseName} (${w.firstName}'s Spouse Birthday)`);
      }
      if ((w.maritalStatus === "विवाहित" || w.maritalStatus === "Married") && w.spouseName && w.anniversaryDate && isSameDayMonth(w.anniversaryDate, targetDate)) {
        conflicts.push(`🎉 ${w.firstName} & ${w.spouseName} (Wedding Anniversary)`);
      }
    });

    // 2. Todos
    todos.forEach((t) => {
      if (isSameDate(t.date, targetDate)) {
        conflicts.push(`📝 Todo: ${t.title}`);
      }
    });

    // 3. Already Approved Event Requests
    requests.forEach((r) => {
      if (r._id !== excludeId && r.status === "Approved" && isSameDate(r.eventDate, targetDate)) {
        conflicts.push(`🎉 Event: ${r.eventName} (${r.eventOrganizer})`);
      }
    });

    return conflicts;
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filter === "All" || req.status === filter;
    const matchesSearch = 
      req.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.eventOrganizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Manage Event Requests – Saheb Invitations Admin</title>
        <meta name="description" content="Review, approve, and conflict check Saheb's event invitations." />
      </Head>

      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-orange-100 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Event Requests Management</h1>
            <p className="text-slate-500 text-sm mt-1">Review invitation requests, perform calendar conflict checks, and set reminders.</p>
          </div>

          {/* Quick Filters */}
          <div className="flex bg-slate-100 rounded-xl p-1 self-start md:self-auto text-xs">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg font-bold transition-all ${
                  filter === status
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white border border-orange-100 rounded-2xl px-4 py-2.5 shadow-sm max-w-md">
          <HiSearch className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event, organizer, venue, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500 font-medium">Loading invitation requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white border border-orange-100 rounded-3xl p-6">
            <p className="text-slate-500 font-medium">No event requests found matching criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => {
              const isExpanded = expandedRequestId === req._id;
              const conflicts = getConflictsForDate(req.eventDate, req._id);
              const hasConflicts = conflicts.length > 0;

              return (
                <div
                  key={req._id}
                  className={`bg-white border rounded-3xl shadow-sm p-6 space-y-4 flex flex-col justify-between transition-all ${
                    req.status === "Approved"
                      ? "border-blue-100 bg-gradient-to-br from-white to-blue-50/5"
                      : req.status === "Rejected"
                      ? "border-red-100 bg-gradient-to-br from-white to-red-50/5"
                      : "border-orange-100/80 hover:border-orange-200"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-800 leading-tight text-base">{req.eventName}</h3>
                        <span className="text-slate-400 font-medium text-xs mt-0.5 block">{req.eventOrganizer}</span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === "Approved"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : req.status === "Rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {req.status}
                        </span>
                        
                        <button
                          onClick={() => setExpandedRequestId(isExpanded ? null : req._id)}
                          className="flex items-center gap-0.5 text-xs text-orange-500 hover:text-orange-600 font-bold transition-colors"
                        >
                          {isExpanded ? (
                            <>Hide Info <HiChevronUp className="w-4 h-4" /></>
                          ) : (
                            <>View Details <HiChevronDown className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Core details always visible */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                      <div>
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Date</span>
                        {new Date(req.eventDate).toLocaleDateString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Time & Venue</span>
                        {req.eventTime} at {req.eventLocation}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-dashed border-slate-100 text-xs text-slate-600 animate-fade-in">
                        <div>
                          <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Description / Purpose</span>
                          <p className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mt-1">{req.description}</p>
                        </div>
                        
                        <div>
                          <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Invitation Image</span>
                          {req.image ? (
                            <div className="relative group max-w-xs mt-1">
                              <img
                                src={req.image}
                                alt="Invitation"
                                className="w-full h-36 object-cover rounded-xl border border-slate-100 cursor-pointer"
                                onClick={() => window.open(req.image, "_blank")}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                                <button
                                  onClick={() => document.getElementById(`admin-upload-${req._id}`).click()}
                                  className="px-2.5 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                                >
                                  <HiCloudUpload className="w-3.5 h-3.5 text-orange-500" />
                                  Upload
                                </button>
                                <button
                                  onClick={() => startCamera(req._id)}
                                  className="px-2.5 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                                >
                                  <HiCamera className="w-3.5 h-3.5" />
                                  Camera
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2.5 mt-1 max-w-xs">
                              <button
                                onClick={() => document.getElementById(`admin-upload-${req._id}`).click()}
                                className="flex-grow py-2 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                              >
                                <HiCloudUpload className="w-4 h-4 text-orange-500" />
                                Upload Card
                              </button>
                              <button
                                onClick={() => startCamera(req._id)}
                                className="flex-grow py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
                              >
                                <HiCamera className="w-4 h-4" />
                                Take Photo
                              </button>
                            </div>
                          )}
                          <input
                            id={`admin-upload-${req._id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAdminFileChange(e, req._id)}
                          />
                        </div>

                        {req.contactDetails && (
                          <div>
                            <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider">Organizer Contact</span>
                            <div className="mt-0.5">{req.contactDetails}</div>
                          </div>
                        )}
                        <div className="flex justify-between items-center bg-slate-50 rounded-xl p-2 border border-slate-100 text-[11px]">
                          <span>Requested by: <span className="font-bold text-slate-700">{req.username}</span></span>
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Rejection remark display */}
                    {req.status === "Rejected" && req.remark && (
                      <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800 animate-fade-in">
                        <span className="font-bold">Rejection Reason:</span> {req.remark}
                      </div>
                    )}

                    {/* Reminder details if approved */}
                    {req.status === "Approved" && (req.reminderConfig?.oneDayBefore || req.reminderConfig?.twoHoursBefore || req.reminderConfig?.customTime) && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 animate-fade-in space-y-1">
                        <span className="font-bold block text-[10px] uppercase text-blue-600 tracking-wider">Active Reminders:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {req.reminderConfig.oneDayBefore && <li>1 day before event</li>}
                          {req.reminderConfig.twoHoursBefore && <li>2 hours before event</li>}
                          {req.reminderConfig.customTime && (
                            <li>Custom: {new Date(req.reminderConfig.customTime).toLocaleString()}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions & Conflict Check for Pending requests */}
                  {req.status === "Pending" && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 mt-4">
                      {/* Conflict Check list */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Saheb's Schedule Conflict Check:</span>
                        {hasConflicts ? (
                          <div className="space-y-1.5">
                            <span className="text-red-500 font-semibold flex items-center gap-1">
                              <HiExclamation className="w-4 h-4 flex-shrink-0" /> Conflict warning ({conflicts.length} scheduled):
                            </span>
                            <ul className="list-disc pl-4 text-slate-500 text-[11px] space-y-0.5 leading-relaxed">
                              {conflicts.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <HiCheck className="w-4 h-4 flex-shrink-0" /> No conflicts found (Saheb is free on this date)
                          </span>
                        )}
                      </div>

                      {/* Decision controls */}
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleApproveRequest(req._id)}
                          className="flex-grow py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm shadow-green-600/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <HiCheck className="w-4 h-4" /> Approve Event
                        </button>
                        <button
                          onClick={() => setShowRejectFormId(showRejectFormId === req._id ? null : req._id)}
                          className="flex-grow py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-sm shadow-red-500/10 transition-colors flex items-center justify-center gap-1"
                        >
                          <HiX className="w-4 h-4" /> Reject Event
                        </button>
                      </div>

                      {/* Rejection reason textarea inline */}
                      {showRejectFormId === req._id && (
                        <div className="space-y-2 pt-2 animate-fade-in border-t border-slate-100">
                          <textarea
                            rows={2.5}
                            value={rejectionReason[req._id] || ""}
                            onChange={(e) => setRejectionReason((prev) => ({ ...prev, [req._id]: e.target.value }))}
                            placeholder="Provide rejection remark or reason..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowRejectFormId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req._id)}
                              className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Submit Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* permanent request deletion control */}
                  {req.status !== "Pending" && (
                    <div className="flex justify-end pt-3 border-t border-slate-50 mt-4">
                      <button
                        onClick={() => handleDeleteRequest(req._id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Request"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Capture Modal/Overlay */}
      {activeCameraId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg border border-orange-100 flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <HiCamera className="w-5 h-5 text-orange-500" />
                Capture Event Photo
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Video Preview */}
            <div className="bg-slate-950 aspect-video relative flex items-center justify-center overflow-hidden">
              {!cameraStream && !cameraError && (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-xs">Initializing camera...</p>
                </div>
              )}
              
              {cameraError && (
                <div className="p-6 text-center space-y-3">
                  <p className="text-red-500 text-sm font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startCamera(activeCameraId, facingMode)}
                    className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!cameraStream ? "hidden" : ""}`}
                style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
              />
            </div>
            
            {/* Actions Bar */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {cameraStream && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 p-1 flex items-center justify-center shadow-lg shadow-orange-500/25 border-4 border-white transition-all transform hover:scale-105 active:scale-95"
                  title="Capture photo"
                >
                  <span className="w-10 h-10 rounded-full border-2 border-white/50 block" />
                </button>
              )}
              
              <button
                type="button"
                disabled={!cameraStream}
                onClick={toggleCamera}
                className="px-3 py-2 text-orange-600 hover:text-orange-700 disabled:opacity-40 text-sm font-semibold rounded-lg flex items-center gap-1 transition-all"
                title="Switch Camera"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                </svg>
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
