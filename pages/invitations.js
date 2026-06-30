import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiPlus, HiClock, HiCheckCircle, HiXCircle, HiInformationCircle, HiCamera, HiCloudUpload } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";

export default function Invitations() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("track"); // "submit" or "track"
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    eventTime: "",
    eventOrganizer: "",
    eventLocation: "",
    description: "",
    contactDetails: "",
    image: "",
  });

  // Camera states
  const [activeCameraField, setActiveCameraField] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = React.useRef(null);

  // Reminder states (indexed by request ID)
  const [reminders, setReminders] = useState({});

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) {
      router.push("/login");
    }
  }, [router]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem("username");
      if (!username) return;
      const res = await fetch(`/api/event-requests?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.requests);
        
        // Initialize reminders state
        const reminderInit = {};
        data.requests.forEach(r => {
          if (r.status === "Approved") {
            reminderInit[r._id] = {
              oneDayBefore: r.reminderConfig?.oneDayBefore || false,
              twoHoursBefore: r.reminderConfig?.twoHoursBefore || false,
              customTime: r.reminderConfig?.customTime 
                ? new Date(r.reminderConfig.customTime).toISOString().slice(0, 16) 
                : "",
            };
          }
        });
        setReminders(reminderInit);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invitation requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setActiveCameraField(null);
  }, [cameraStream]);

  const startCamera = async (mode = "user") => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setActiveCameraField("image");
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
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      stopCamera();
    }
  };

  // Bind video stream once video element mounts
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeCameraField]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventName || !form.eventDate || !form.eventTime || !form.eventOrganizer || !form.eventLocation || !form.description) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "user";
      const payload = {
        ...form,
        username,
      };

      const res = await fetch("/api/event-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Invitation request submitted successfully!");
        setForm({
          eventName: "",
          eventDate: "",
          eventTime: "",
          eventOrganizer: "",
          eventLocation: "",
          description: "",
          contactDetails: "",
          image: "",
        });
        setActiveTab("track");
        fetchRequests();
      } else {
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReminderChange = (reqId, field, value) => {
    setReminders((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        [field]: value,
      },
    }));
  };

  const handleSaveReminders = async (reqId) => {
    const config = reminders[reqId];
    if (!config) return;

    try {
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderConfig: {
            oneDayBefore: config.oneDayBefore,
            twoHoursBefore: config.twoHoursBefore,
            customTime: config.customTime ? new Date(config.customTime) : null,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Reminders saved successfully!");
        fetchRequests();
      } else {
        toast.error(data.error || "Failed to save reminders.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving reminders.");
    }
  };

  return (
    <>
      <Head>
        <title>Saheb Event Invitations – Tracking & Request Dashboard</title>
        <meta name="description" content="Submit and track event invitation requests to Saheb Punit Joshi." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-orange-100 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Saheb Event Invitations</h1>
            <p className="text-slate-500 text-sm mt-1">Submit event requests and track Saheb's availability.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "track"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "submit"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiPlus className="w-4 h-4" /> Request Invitation
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "submit" ? (
          <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-6">New Event Invitation Request</h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Name *</label>
                  <input
                    type="text"
                    name="eventName"
                    required
                    value={form.eventName}
                    onChange={handleInputChange}
                    placeholder="e.g. Annual Youth Conclave"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Organizer *</label>
                  <input
                    type="text"
                    name="eventOrganizer"
                    required
                    value={form.eventOrganizer}
                    onChange={handleInputChange}
                    placeholder="e.g. Rotary Club Mandvi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    value={form.eventDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Time *</label>
                  <input
                    type="text"
                    name="eventTime"
                    required
                    value={form.eventTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 05:00 PM to 07:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Location / Venue *</label>
                <input
                  type="text"
                  name="eventLocation"
                  required
                  value={form.eventLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Town Hall Auditorium, Mandvi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purpose / Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe Saheb's role, event goals, chief guests..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Image / Invitation Card (Optional)</label>
                <div className="relative">
                  {form.image ? (
                    <div className="max-w-xs space-y-3">
                      <img
                        src={form.image}
                        alt="Event Preview"
                        className="w-full h-40 object-cover rounded-xl border border-orange-100"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => document.getElementById('event-image-upload').click()}
                          className="flex-grow py-2 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                        >
                          <HiCloudUpload className="w-4 h-4 text-orange-500" />
                          Upload New
                        </button>
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="flex-grow py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
                        >
                          <HiCamera className="w-4 h-4" />
                          Use Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-xs p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-orange-50/10 rounded-xl flex flex-col items-center justify-center transition-all duration-300">
                      <div className="flex flex-col gap-3 w-full mt-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById('event-image-upload').click()}
                          className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-700 font-semibold shadow-sm"
                        >
                          <HiCloudUpload className="w-5 h-5 text-orange-500" />
                          Upload Invitation
                        </button>
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-orange-500/10"
                        >
                          <HiCamera className="w-5 h-5" />
                          Take Photo
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    id="event-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Details of Organizer (Optional)</label>
                <input
                  type="text"
                  name="contactDetails"
                  value={form.contactDetails}
                  onChange={handleInputChange}
                  placeholder="e.g. Rajesh Kumar (+91 98765 43210)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Submitting Request..." : "Submit Request to Admin"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                <p className="text-sm text-slate-500">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 bg-white border border-orange-100 rounded-3xl p-6">
                <HiInformationCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">You have not submitted any event invitation requests yet.</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-4 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold rounded-xl transition-colors border border-orange-100"
                >
                  Create Your First Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((req) => {
                  const reminderConfig = reminders[req._id] || { oneDayBefore: false, twoHoursBefore: false, customTime: "" };

                  return (
                    <div
                      key={req._id}
                      className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                    >
                      <div className="space-y-3.5 flex-1">
                        {/* Event Name & Status Badge */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg font-bold text-slate-800">{req.eventName}</h3>
                          
                          {req.status === "Pending" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <HiClock className="w-3.5 h-3.5" /> Pending Review
                            </span>
                          )}
                          {req.status === "Approved" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                              <HiCheckCircle className="w-3.5 h-3.5" /> Approved
                            </span>
                          )}
                          {req.status === "Rejected" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                              <HiXCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </div>

                        {/* Details Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-slate-600">
                          <div>
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Organizer</span>
                            {req.eventOrganizer}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Date & Time</span>
                            {new Date(req.eventDate).toLocaleDateString()} at {req.eventTime}
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Location</span>
                            {req.eventLocation}
                          </div>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">Description</span>
                          <p className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">{req.description}</p>
                        </div>

                        {req.image && (
                          <div className="text-xs text-slate-600">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">Invitation Card</span>
                            <img
                              src={req.image}
                              alt="Invitation"
                              className="max-w-xs h-32 object-cover rounded-xl border border-slate-100 hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => window.open(req.image, "_blank")}
                            />
                          </div>
                        )}

                        {req.contactDetails && (
                          <div className="text-xs text-slate-500">
                            <span className="font-bold text-slate-400 text-[10px]">Organizer Contact:</span> {req.contactDetails}
                          </div>
                        )}

                        {/* Remarks for rejection */}
                        {req.status === "Rejected" && req.remark && (
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                            <span className="font-bold">Rejection Reason / Remark:</span> {req.remark}
                          </div>
                        )}
                      </div>

                      {/* Reminders section if approved */}
                      {req.status === "Approved" && (
                        <div className="md:w-72 bg-slate-50/60 rounded-2xl border border-slate-100 p-4 space-y-3.5 self-start md:self-stretch flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <HiClock className="w-4 h-4 text-orange-500" /> Admin Reminders
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Schedule reminders for Saheb before the event.</p>
                          </div>

                          <div className="space-y-2 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={reminderConfig.oneDayBefore}
                                onChange={(e) => handleReminderChange(req._id, "oneDayBefore", e.target.checked)}
                                className="rounded text-orange-500 focus:ring-orange-500"
                              />
                              <span>1 day before event</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={reminderConfig.twoHoursBefore}
                                onChange={(e) => handleReminderChange(req._id, "twoHoursBefore", e.target.checked)}
                                className="rounded text-orange-500 focus:ring-orange-500"
                              />
                              <span>2 hours before event</span>
                            </label>

                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-500 block">Custom Reminder Time:</span>
                              <input
                                type="datetime-local"
                                value={reminderConfig.customTime}
                                onChange={(e) => handleReminderChange(req._id, "customTime", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveReminders(req._id)}
                            className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-colors text-center"
                          >
                            Save Reminders
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Capture Modal/Overlay */}
      {activeCameraField && (
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
                    onClick={() => startCamera(facingMode)}
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
