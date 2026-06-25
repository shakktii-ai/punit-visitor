import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiPlus, HiClock, HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi";
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
  });

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
    </>
  );
}
