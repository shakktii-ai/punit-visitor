import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiArrowLeft, HiChevronLeft, HiChevronRight, HiPlus, HiTrash, HiCheck, HiPencil, HiClock } from "react-icons/hi";
import "react-toastify/dist/ReactToastify.css";

const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const englishWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const getPositionText = (pos) => positionTranslation[pos] || pos;

export default function AdminCalendar() {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [workers, setWorkers] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected date details modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodo, setEditingTodo] = useState({ title: "", description: "" });
  const [expandedEventIndex, setExpandedEventIndex] = useState(null);
  const [eventRequests, setEventRequests] = useState([]);
  const [rejectionReason, setRejectionReason] = useState({});
  const [showRejectFormId, setShowRejectFormId] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const allowedPagesStr = localStorage.getItem("allowedPages");
    const allowedPages = allowedPagesStr ? JSON.parse(allowedPagesStr) : [];

    if (role !== "admin") {
      router.push("/login");
    } else if (username !== "admin" && !allowedPages.includes("/admin/calendar")) {
      router.push("/admin");
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const [workersRes, todosRes, requestsRes] = await Promise.all([
        fetch("/api/workers?limit=1000"), // Get all workers to calculate birthdays
        fetch("/api/todos"),
        fetch("/api/event-requests", {
          headers: {
            "x-username": username
          }
        })
      ]);

      const workersData = await workersRes.json();
      const todosData = await todosRes.json();
      const requestsData = await requestsRes.json();

      if (workersRes.ok && workersData.success) {
        setWorkers(workersData.workers);
      }
      if (todosRes.ok && todosData.success) {
        setTodos(todosData.todos);
      }
      if (requestsRes.ok && requestsData.success) {
        setEventRequests(requestsData.requests);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calendar Math
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonthDays = [];
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(new Date(prevYear, prevMonth, daysInPrevMonth - i));
  }

  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(new Date(year, month, i));
  }

  const nextMonthDays = [];
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const totalSlots = 42; 
  const remainingSlots = totalSlots - (prevMonthDays.length + currentMonthDays.length);
  for (let i = 1; i <= remainingSlots; i++) {
    nextMonthDays.push(new Date(nextYear, nextMonth, i));
  }

  const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Helper: check if two dates are same calendar day/month (ignoring year)
  const isSameDayMonth = (dateA, dateB) => {
    if (!dateA || !dateB) return false;
    const dA = new Date(dateA);
    const dB = new Date(dateB);
    return dA.getDate() === dB.getDate() && dA.getMonth() === dB.getMonth();
  };

  // Helper: check if two dates are exactly the same day/month/year
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

  // Extract events for a date
  const getEventsForDate = (date) => {
    const dayEvents = [];

    // 1. Birthdays & Anniversaries
    workers.forEach((w) => {
      // Worker Birthday
      if (w.DOB && isSameDayMonth(w.DOB, date)) {
        dayEvents.push({ type: "worker_birthday", label: `🎂 ${w.firstName} ${w.lastName} (Birthday)`, name: `${w.firstName} ${w.lastName}`, worker: w });
      }
      // Spouse Birthday
      if ((w.maritalStatus === "विवाहित" || w.maritalStatus === "Married") && w.spouseName && w.spouseDOB && isSameDayMonth(w.spouseDOB, date)) {
        dayEvents.push({ type: "spouse_birthday", label: `🎂 ${w.spouseName} (${w.firstName}'s Spouse Birthday)`, name: w.spouseName, worker: w });
      }
      // Wedding Anniversary
      if ((w.maritalStatus === "विवाहित" || w.maritalStatus === "Married") && w.spouseName && w.anniversaryDate && isSameDayMonth(w.anniversaryDate, date)) {
        dayEvents.push({ type: "wedding_anniversary", label: `🎉 ${w.firstName} & ${w.spouseName} (Wedding Anniversary)`, worker: w });
      }
      // Father Birthday
      if (w.fatherName && w.fatherDOB && isSameDayMonth(w.fatherDOB, date)) {
        dayEvents.push({ type: "father_birthday", label: `🎂 ${w.fatherName} (${w.firstName}'s Father Birthday)`, worker: w });
      }
      // Mother Birthday
      if (w.motherName && w.motherDOB && isSameDayMonth(w.motherDOB, date)) {
        dayEvents.push({ type: "mother_birthday", label: `🎂 ${w.motherName} (${w.firstName}'s Mother Birthday)`, worker: w });
      }
      // Parents Anniversary
      if (w.fatherName && w.motherName && w.parentsAnniversaryDate && isSameDayMonth(w.parentsAnniversaryDate, date)) {
        dayEvents.push({ type: "parents_anniversary", label: `🎉 ${w.fatherName} & ${w.motherName} (Parents' Anniversary)`, worker: w });
      }
    });

    // 2. Todos
    const dayTodos = todos.filter((t) => isSameDate(t.date, date));
    dayTodos.forEach((t) => {
      dayEvents.push({ type: "todo", label: `${t.completed ? "✓" : "📝"} ${t.title}`, completed: t.completed, raw: t });
    });

    // 3. Approved Event Requests
    const dayRequests = eventRequests.filter((r) => r.status === "Approved" && isSameDate(r.eventDate, date));
    dayRequests.forEach((r) => {
      dayEvents.push({
        type: "approved_event",
        label: `🎉 ${r.eventName} (${r.eventOrganizer})`,
        raw: r,
      });
    });

    return dayEvents;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Add Todo Action
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) {
      toast.warning("Please enter a task title.");
      return;
    }

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodo.title,
          description: newTodo.description,
          date: selectedDate.toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Task added successfully!");
        setNewTodo({ title: "", description: "" });
        setShowAddForm(false);
        fetchData();
        // Update selected date modal state manually by appending the new todo
        setTodos((prev) => [...prev, data.todo]);
      } else {
        toast.error("Failed to add task.");
      }
    } catch {
      toast.error("Could not contact the server.");
    }
  };

  // Toggle Completed Status
  const handleToggleTodo = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Status updated.");
        fetchData();
      }
    } catch {
      toast.error("Error updating status.");
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (todoId) => {
    try {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Task removed successfully.");
        fetchData();
      }
    } catch {
      toast.error("Error removing task.");
    }
  };

  // Edit Todo Save
  const handleSaveEditTodo = async (e) => {
    e.preventDefault();
    if (!editingTodo.title.trim()) return;

    try {
      const res = await fetch(`/api/todos/${editingTodoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Changes saved!");
        setEditingTodoId(null);
        fetchData();
      }
    } catch {
      toast.error("Error saving changes.");
    }
  };

  const handleApproveRequest = async (reqId) => {
    try {
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Event request approved!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to approve event request.");
      }
    } catch {
      toast.error("Error updating event status.");
    }
  };

  const handleRejectRequest = async (reqId) => {
    const remark = rejectionReason[reqId] || "";
    try {
      const res = await fetch(`/api/event-requests/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", remark }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Event request rejected.");
        setRejectionReason((prev) => ({ ...prev, [reqId]: "" }));
        setShowRejectFormId(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to reject event request.");
      }
    } catch {
      toast.error("Error updating event status.");
    }
  };

  const getRemindersForAdmin = () => {
    const alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    eventRequests.forEach((req) => {
      if (req.status !== "Approved") return;

      const eventDate = new Date(req.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1 day before reminder
      if (req.reminderConfig?.oneDayBefore && diffDays === 1) {
        alerts.push({
          id: `${req._id}-1day`,
          message: `Reminder (1 Day Before): Approved event "${req.eventName}" is scheduled for tomorrow at ${req.eventTime}.`,
          request: req,
        });
      }

      // 2 hours before reminder (if event is today)
      if (req.reminderConfig?.twoHoursBefore && diffDays === 0) {
        alerts.push({
          id: `${req._id}-2hr`,
          message: `Reminder (2 Hours Before): Approved event "${req.eventName}" is scheduled for TODAY at ${req.eventTime}.`,
          request: req,
        });
      }

      // Custom time reminder
      if (req.reminderConfig?.customTime) {
        const customTime = new Date(req.reminderConfig.customTime);
        const now = new Date();
        const diffMs = now.getTime() - customTime.getTime();
        if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
          alerts.push({
            id: `${req._id}-custom`,
            message: `Custom Reminder: Approved event "${req.eventName}" is coming up! Scheduled on ${new Date(req.eventDate).toLocaleDateString()} at ${req.eventTime}.`,
            request: req,
          });
        }
      }
    });

    return alerts;
  };

  return (
    <>
      <Head>
        <title>Admin Calendar</title>
        <meta name="description" content="View worker birthdays, anniversaries, and manage administrative to-do lists." />
      </Head>

      <div className="p-4 md:p-8 space-y-6">
        {/* Active Reminders Banner */}
        {(() => {
          const activeAlerts = getRemindersForAdmin().filter(alert => !dismissedAlerts.includes(alert.id));
          if (activeAlerts.length === 0) return null;
          return (
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⏰</span>
                    <div className="text-sm font-semibold text-slate-800">
                      {alert.message}
                      <span className="block text-xs text-slate-400 font-normal mt-0.5">
                        Organizer: {alert.request.eventOrganizer} | Location: {alert.request.eventLocation}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Administrative Calendar</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Manage worker birthdays, wedding anniversaries, and administrative tasks
              </p>
            </div>
          </div>

          {/* Month Controller */}
          <div className="flex items-center gap-3 bg-white border border-orange-100 rounded-2xl p-1.5 shadow-sm self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50 text-slate-600 transition-colors"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-800 px-2 min-w-[100px] text-center">
              {englishMonths[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50 text-slate-600 transition-colors"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
          {/* Weekdays Headers */}
          <div className="grid grid-cols-7 bg-orange-50/60 border-b border-orange-100 text-center py-3">
            {englishWeekdays.map((day) => (
              <span key={day} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Days Cells */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-orange-100/50 border-b border-r border-orange-100/50">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === month;
                const isToday = isSameDate(day, new Date());
                const dayEvents = getEventsForDate(day);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowAddForm(false);
                      setEditingTodoId(null);
                      setExpandedEventIndex(null);
                      setShowRejectFormId(null);
                    }}
                    className={`min-h-[110px] p-2 flex flex-col justify-between hover:bg-orange-50/20 cursor-pointer transition-colors group relative ${
                      isCurrentMonth ? "bg-white" : "bg-slate-50/50 text-slate-400"
                    } ${isToday ? "bg-gradient-to-b from-orange-500/5 to-amber-500/5" : ""}`}
                  >
                    {/* Day number & Dot/Text Indicators */}
                    <div className="flex flex-col justify-between h-full w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                            isToday
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                              : isCurrentMonth
                              ? "text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        
                        {/* Mobile view dot indicators */}
                        <div className="flex sm:hidden gap-1">
                          {dayEvents.filter(e => e.type.includes("birthday") || e.type.includes("anniversary")).length > 0 && (
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          )}
                          {dayEvents.filter(e => e.type === "todo").length > 0 && (
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          )}
                          {dayEvents.filter(e => e.type === "approved_event").length > 0 && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Desktop view indicators */}
                      <div className="hidden sm:flex flex-col gap-1 mt-auto w-full">
                        {/* Dots for birthdays/anniversaries and todos */}
                        <div className="flex gap-1">
                          {dayEvents.filter(e => e.type.includes("birthday") || e.type.includes("anniversary")).length > 0 && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" title="Birthday / Anniversary" />
                          )}
                          {dayEvents.filter(e => e.type === "todo").length > 0 && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="To-Do Task" />
                          )}
                        </div>

                        {/* Approved Event names instead of blue dots */}
                        {dayEvents.filter(e => e.type === "approved_event").map((evt, eIdx) => (
                          <div
                            key={eIdx}
                            title={evt.label}
                            className="text-[9px] px-1.5 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-100 font-bold truncate w-full"
                          >
                            {evt.raw?.eventName}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Date Drawer/Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-orange-100 animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-orange-50">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    {englishMonths[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">Scheduled events for the selected date</p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 text-lg font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Sub-section 1: Events, Birthdays & Anniversaries */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Events, Birthdays & Anniversaries
                </h3>
                {(() => {
                  const items = getEventsForDate(selectedDate).filter((e) => e.type !== "todo");
                  if (items.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        No events, birthdays or anniversaries on this day.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {items.map((item, iIdx) => {
                        const isApprovedEvent = item.type === "approved_event";
                        const isAnniv = item.type.includes("anniversary");
                        const isExpanded = expandedEventIndex === iIdx;
                        const w = item.worker;
                        return (
                          <div
                            key={iIdx}
                            onClick={() => setExpandedEventIndex(isExpanded ? null : iIdx)}
                            className={`p-3 rounded-xl border flex flex-col gap-2 text-sm transition-all cursor-pointer ${
                              isApprovedEvent
                                ? "bg-blue-50/70 border-blue-100 text-blue-800 hover:bg-blue-50"
                                : isAnniv
                                ? "bg-purple-50/70 border-purple-100 text-purple-800 hover:bg-purple-50"
                                : "bg-orange-50/70 border-orange-100 text-orange-800 hover:bg-orange-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 font-semibold">
                              <span>{isAnniv ? "🎉" : "🎂"}</span>
                              <span className="leading-tight flex-1">{item.label}</span>
                              <span className="text-xs text-slate-400 font-normal">
                                {isExpanded ? "▲ Hide" : "▼ Details"}
                              </span>
                            </div>
                            {isExpanded && w && (
                              <div
                                className="mt-2 pt-2 border-t border-dashed border-slate-200 text-xs text-slate-600 space-y-1.5 font-normal animate-fade-in"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div>
                                  <span className="font-bold text-slate-500">Worker:</span> {w.firstName} {w.middleName || ""} {w.lastName}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500">Contact No:</span> {w.primaryPhone || "N/A"}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500">Position:</span> {getPositionText(w.position)}
                                </div>
                                {w.areaNameOrBooth && (
                                  <div>
                                    <span className="font-bold text-slate-500">Area/Booth:</span> {w.areaNameOrBooth}
                                  </div>
                                )}
                                <div className="pt-2 flex gap-2">
                                  <button
                                    onClick={() => router.push(`/admin/edit-worker/${w._id}`)}
                                    className="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] transition-colors"
                                  >
                                    Edit Worker
                                  </button>
                                  {w.primaryPhone && (
                                    <a
                                      href={`tel:${w.primaryPhone}`}
                                      className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] text-center transition-colors"
                                    >
                                      Call
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                            {isExpanded && isApprovedEvent && item.raw && (
                              <div
                                className="mt-2 pt-2 border-t border-dashed border-slate-200 text-xs text-slate-600 space-y-1.5 font-normal animate-fade-in"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div>
                                  <span className="font-bold text-slate-500">Event Name:</span> {item.raw.eventName}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500">Organizer:</span> {item.raw.eventOrganizer}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500">Time & Venue:</span> {item.raw.eventTime} at {item.raw.eventLocation}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-500">Purpose:</span> {item.raw.description}
                                </div>
                                {item.raw.contactDetails && (
                                  <div>
                                    <span className="font-bold text-slate-500">Contact:</span> {item.raw.contactDetails}
                                  </div>
                                )}
                                <div className="pt-2">
                                  <button
                                    onClick={() => router.push(`/admin/event-requests`)}
                                    className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] transition-colors"
                                  >
                                    Manage Events
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Sub-section 3: Event Invitation Requests */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Event Invitation Requests
                </h3>
                {(() => {
                  const items = eventRequests.filter((r) => isSameDate(r.eventDate, selectedDate));
                  if (items.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        No invitation requests for this day.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3.5">
                      {items.map((req) => {
                        const isPending = req.status === "Pending";
                        const isApproved = req.status === "Approved";
                        const isRejected = req.status === "Rejected";
                        
                        // Conflict Check
                        const otherEvents = getEventsForDate(selectedDate).filter(e => e.raw?._id !== req._id);

                        return (
                          <div
                            key={req._id}
                            className={`p-4 rounded-2xl border space-y-3 ${
                              isApproved
                                ? "bg-blue-50/50 border-blue-100 text-blue-900"
                                : isRejected
                                ? "bg-red-50/50 border-red-100 text-red-900"
                                : "bg-white border-orange-100/80 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-800">{req.eventName}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isApproved
                                  ? "bg-blue-100 text-blue-700"
                                  : isRejected
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {req.status}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-600">
                              <div><span className="font-semibold text-slate-400">Organizer:</span> {req.eventOrganizer}</div>
                              <div><span className="font-semibold text-slate-400">Time & Location:</span> {req.eventTime} at {req.eventLocation}</div>
                              <div><span className="font-semibold text-slate-400">Purpose:</span> {req.description}</div>
                              {req.contactDetails && (
                                <div><span className="font-semibold text-slate-400">Contact:</span> {req.contactDetails}</div>
                              )}
                              <div><span className="font-semibold text-slate-400">Requested By:</span> User ({req.username})</div>
                            </div>

                            {isRejected && req.remark && (
                              <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-xs text-red-700">
                                <span className="font-bold">Rejection Reason:</span> {req.remark}
                              </div>
                            )}

                            {isPending && (
                              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                                {/* Conflict Checking UI */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1 text-xs">
                                  <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">Conflict Checking:</span>
                                  {otherEvents.length === 0 ? (
                                    <span className="text-green-600 font-semibold">✓ No conflicts (0 events scheduled)</span>
                                  ) : (
                                    <div className="space-y-1">
                                      <span className="text-red-500 font-semibold">⚠ Conflict warning ({otherEvents.length} events scheduled):</span>
                                      <ul className="list-disc pl-4 text-slate-500 text-[11px] space-y-0.5">
                                        {otherEvents.map((evt, idx) => (
                                          <li key={idx}>{evt.label}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                {/* Decision Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveRequest(req._id)}
                                    className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setShowRejectFormId(showRejectFormId === req._id ? null : req._id)}
                                    className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-sm transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>

                                {showRejectFormId === req._id && (
                                  <div className="space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                    <textarea
                                      rows={2}
                                      value={rejectionReason[req._id] || ""}
                                      onChange={(e) => setRejectionReason((prev) => ({ ...prev, [req._id]: e.target.value }))}
                                      placeholder="Provide an optional remark or reason..."
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => setShowRejectFormId(null)}
                                        className="px-2.5 py-1 rounded text-xs text-slate-500 hover:bg-slate-100 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleRejectRequest(req._id)}
                                        className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm"
                                      >
                                        Confirm Reject
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Sub-section 2: To-Do Tasks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    To-Do List
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setEditingTodoId(null);
                    }}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-bold transition-colors"
                  >
                    <HiPlus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>

                {/* Add Todo Form */}
                {showAddForm && (
                  <form onSubmit={handleAddTodo} className="bg-orange-50/30 border border-orange-100/50 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-slate-800">Add New Task</h4>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTodo.title}
                        onChange={(e) => setNewTodo((p) => ({ ...p, title: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl text-xs p-2.5 outline-none focus:border-orange-500 transition-colors"
                      />
                      <textarea
                        placeholder="Details or description..."
                        value={newTodo.description}
                        onChange={(e) => setNewTodo((p) => ({ ...p, description: e.target.value }))}
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-xl text-xs p-2.5 outline-none focus:border-orange-500 transition-colors resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* Todos List */}
                {(() => {
                  const items = getEventsForDate(selectedDate).filter((e) => e.type === "todo");
                  if (items.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        No tasks scheduled for this day.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3.5">
                      {items.map((item, iIdx) => {
                        const todo = item.raw;
                        const isEditing = editingTodoId === todo._id;

                        if (isEditing) {
                          return (
                            <form key={todo._id} onSubmit={handleSaveEditTodo} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                              <input
                                type="text"
                                value={editingTodo.title}
                                onChange={(e) => setEditingTodo((p) => ({ ...p, title: e.target.value }))}
                                className="w-full bg-white border border-slate-200 rounded-xl text-xs p-2.5 outline-none focus:border-orange-500"
                              />
                              <textarea
                                value={editingTodo.description}
                                onChange={(e) => setEditingTodo((p) => ({ ...p, description: e.target.value }))}
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-xl text-xs p-2.5 outline-none focus:border-orange-500 resize-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingTodoId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={todo._id}
                            className={`p-3.5 rounded-2xl border flex justify-between items-start gap-3 transition-colors ${
                              todo.completed
                                ? "bg-slate-50/80 border-slate-100 text-slate-400"
                                : "bg-white border-orange-100/60 shadow-sm"
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <button
                                onClick={() => handleToggleTodo(todo)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 mt-0.5 ${
                                  todo.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-slate-300 hover:border-orange-500"
                                }`}
                              >
                                {todo.completed && <HiCheck className="w-4.5 h-4.5" />}
                              </button>
                              <div className="min-w-0 leading-tight">
                                <p className={`text-sm font-semibold break-words ${todo.completed ? "line-through" : "text-slate-800"}`}>
                                  {todo.title}
                                </p>
                                {todo.description && (
                                  <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">
                                    {todo.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingTodoId(todo._id);
                                  setEditingTodo({ title: todo.title, description: todo.description });
                                  setShowAddForm(false);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteTodo(todo._id);
                                  // Update selected date modal state manually by filtering out deleted todo
                                  setTodos((prev) => prev.filter((t) => t._id !== todo._id));
                                }}
                                className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
