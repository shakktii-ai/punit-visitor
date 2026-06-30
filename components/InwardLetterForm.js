import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { HiMail, HiUser, HiPhone, HiCalendar, HiArrowLeft, HiSave, HiCamera, HiCloudUpload } from "react-icons/hi";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" }
];

export default function InwardLetterForm({ initialData, onSubmit, isSubmitting, backPath = "/admin/inward-letters", createdBy = "admin" }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    photo: "",
    inwardDate: "",
    inwardNumber: "",
    subject: "",
    senderName: "",
    senderContact: "",
    department: "",
    assignedPerson: "",
    actionTaken: "",
    status: "Pending",
    remark: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const formatInputDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          return new Date(dateStr).toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      setFormData({
        photo: initialData.photo || "",
        inwardDate: formatInputDate(initialData.inwardDate),
        inwardNumber: initialData.inwardNumber || "",
        subject: initialData.subject || "",
        senderName: initialData.senderName || "",
        senderContact: initialData.senderContact || "",
        department: initialData.department || "",
        assignedPerson: initialData.assignedPerson || "",
        actionTaken: initialData.actionTaken || "",
        status: initialData.status || "Pending",
        remark: initialData.remark || "",
      });
    }
  }, [initialData]);

  const [activeCameraField, setActiveCameraField] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);

  const handleTextChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    handleTextChange(name, value);
  }, [handleTextChange]);

  const handleFileChange = useCallback((e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setActiveCameraField(null);
  }, [cameraStream]);

  const startCamera = async (fieldName, mode = "user") => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setActiveCameraField(fieldName);
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
    startCamera(activeCameraField, nextMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && activeCameraField) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setFormData((prev) => ({ ...prev, [activeCameraField]: dataUrl }));
      setErrors((prev) => ({ ...prev, [activeCameraField]: "" }));
      stopCamera();
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeCameraField]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inwardNumber || !formData.inwardNumber.trim()) {
      newErrors.inwardNumber = "Inward Number is required.";
    }
    if (!formData.inwardDate) {
      newErrors.inwardDate = "Inward Date is required.";
    }
    if (!formData.subject || !formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  const renderInput = (label, name, type = "text", placeholder = "") => {
    const hasError = !!errors[name];

    return (
      <div>
        <label className={labelClass}>{label}</label>
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder || "Enter details"}
          className={`${inputClass} ${
            hasError ? "border-red-500 focus:ring-red-500/20" : ""
          }`}
        />
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const renderSelect = (label, name, options) => {
    const hasError = !!errors[name];
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`${inputClass} ${
            hasError ? "border-red-500 focus:ring-red-500/20" : ""
          }`}
        >
          <option value="">Select option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const renderFileUpload = (label, fieldName) => {
    const hasError = !!errors[fieldName];
    return (
      <div className="space-y-1.5">
        <label className={labelClass}>{label}</label>
        <div className="relative">
          {formData[fieldName] ? (
            <div className="max-w-xs space-y-3">
              <img
                src={formData[fieldName]}
                alt="Preview"
                className={`w-full h-40 object-cover rounded-xl border ${
                  hasError ? "border-red-500" : "border-orange-100"
                }`}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${fieldName}`).click()}
                  className="flex-grow py-2 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                >
                  <HiCloudUpload className="w-4 h-4 text-orange-500" />
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(fieldName)}
                  className="flex-grow py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
                >
                  <HiCamera className="w-4 h-4" />
                  Use Camera
                </button>
              </div>
            </div>
          ) : (
            <div className={`w-full max-w-xs p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              hasError
                ? "border-red-500 bg-red-50/10"
                : "border-slate-200 bg-slate-50/50 hover:bg-orange-50/10"
            }`}>
              <div className="flex flex-col gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${fieldName}`).click()}
                  className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-700 font-semibold shadow-sm"
                >
                  <HiCloudUpload className="w-5 h-5 text-orange-500" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(fieldName)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-orange-500/10"
                >
                  <HiCamera className="w-5 h-5" />
                  Take Photo
                </button>
              </div>
            </div>
          )}
          <input
            id={`file-${fieldName}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, fieldName)}
          />
        </div>
        {hasError && <p className="text-xs text-red-500 mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(backPath)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
        >
          <HiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {initialData ? "Edit Inward Letter Details" : "Inward Letter Registration Form"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {initialData ? "Update registered inward letter details" : "Register inward letters received for record-keeping and processing"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Details */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiMail className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">1. Core Letter Details</h2>
          </div>
          {renderFileUpload("Letter Photo / Scan", "photo")}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput("Inward Number *", "inwardNumber", "text", "e.g. INW/2026/001")}
            {renderInput("Inward Date *", "inwardDate", "date")}
            {renderInput("Subject *", "subject", "text", "e.g. Application for Road Construction")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Sender Name", "senderName", "text", "e.g. Ramchandra Patil")}
            {renderInput("Sender Contact", "senderContact", "tel", "e.g. 9876543210")}
          </div>
        </div>

        {/* Section 2: Action & Assignments */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiUser className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">2. Action & Assignment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput("Department", "department", "text", "e.g. Public Works Dept")}
            {renderInput("Assigned Person", "assignedPerson", "text", "e.g. K. D. Jadhav")}
            {renderSelect("Status", "status", STATUS_OPTIONS)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Action Taken", "actionTaken", "text", "e.g. Forwarded to Executive Engineer")}
            {renderInput("Remark", "remark", "text", "e.g. Needs immediate review")}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(backPath)}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/10 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                Save Letter
              </>
            )}
          </button>
        </div>
      </form>

      {/* Camera Stream Overlay */}
      {activeCameraField && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg border border-orange-100 flex flex-col animate-scale-up">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <HiCamera className="w-5 h-5 text-orange-500" />
                Capture Document Photo
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

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
                    onClick={() => startCamera(activeCameraField, facingMode)}
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
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 p-1 flex items-center justify-center shadow-lg border-4 border-white transition-all transform hover:scale-105 active:scale-95"
                >
                  <span className="w-10 h-10 rounded-full border-2 border-white/50 block" />
                </button>
              )}
              <button
                type="button"
                disabled={!cameraStream}
                onClick={toggleCamera}
                className="px-3 py-2 text-orange-600 hover:text-orange-700 disabled:opacity-40 text-sm font-semibold rounded-lg flex items-center gap-1 transition-all"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
