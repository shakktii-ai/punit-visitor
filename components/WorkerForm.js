import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { HiUser, HiPhone, HiMap, HiBriefcase, HiHeart, HiArrowLeft, HiSave, HiCamera, HiCloudUpload } from "react-icons/hi";

const POSITIONS = [
  { value: "Booth Head", label: "Booth Head" },
  { value: "Shakti Kendra Head", label: "Shakti Kendra Head" },
  { value: "Mandal President", label: "Mandal President" },
  { value: "Mandal General Secretary", label: "Mandal General Secretary" },
  { value: "City Vice President", label: "City Vice President" },
  { value: "District Executive Member", label: "District Executive Member" },
  { value: "Worker", label: "Party Worker" },
];

const MARITAL_STATUSES = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

export default function WorkerForm({ initialData, onSubmit, isSubmitting, backPath = "/admin", createdBy = "admin" }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    houseNo: "",
    street: "",
    village: "",
    taluka: "",
    district: "",
    pincode: "",
    primaryPhone: "",
    alternativePhone: "",
    position: "",
    areaNameOrBooth: "",
    DOB: "",
    maritalStatus: "",
    spouseName: "",
    spouseDOB: "",
    anniversaryDate: "",
    fatherName: "",
    fatherDOB: "",
    motherName: "",
    motherDOB: "",
    parentsAnniversaryDate: "",
    photo: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Map initial data to form fields and format dates appropriately for input type="date"
      const formatInputDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          return new Date(dateStr).toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      setFormData({
        firstName: initialData.firstName || "",
        middleName: initialData.middleName || "",
        lastName: initialData.lastName || "",
        houseNo: initialData.houseNo || "",
        street: initialData.street || "",
        village: initialData.village || "",
        taluka: initialData.taluka || "",
        district: initialData.district || "",
        pincode: initialData.pincode || "",
        primaryPhone: initialData.primaryPhone || "",
        alternativePhone: initialData.alternativePhone || "",
        position: initialData.position || "",
        areaNameOrBooth: initialData.areaNameOrBooth || "",
        DOB: formatInputDate(initialData.DOB),
        maritalStatus: initialData.maritalStatus || "",
        spouseName: initialData.spouseName || "",
        spouseDOB: formatInputDate(initialData.spouseDOB),
        anniversaryDate: formatInputDate(initialData.anniversaryDate),
        fatherName: initialData.fatherName || "",
        fatherDOB: formatInputDate(initialData.fatherDOB),
        motherName: initialData.motherName || "",
        motherDOB: formatInputDate(initialData.motherDOB),
        parentsAnniversaryDate: formatInputDate(initialData.parentsAnniversaryDate),
        photo: initialData.photo || "",
      });
    }
  }, [initialData]);

  const [activeCameraField, setActiveCameraField] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);

  const handleTextChange = useCallback((name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "maritalStatus" && value !== "Married") {
        updated.spouseName = "";
        updated.spouseDOB = "";
        updated.anniversaryDate = "";
      }
      return updated;
    });
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formData.primaryPhone || !formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.primaryPhone.trim())) {
      newErrors.primaryPhone = "Mobile number must be exactly 10 digits.";
    }
    if (formData.alternativePhone && formData.alternativePhone.trim() && !/^\d{10}$/.test(formData.alternativePhone.trim())) {
      newErrors.alternativePhone = "Alternative mobile number must be exactly 10 digits.";
    }
    if (!formData.position) {
      newErrors.position = "Position is required.";
    }
    if (formData.pincode && formData.pincode.toString().trim() && !/^\d{6}$/.test(formData.pincode.toString().trim())) {
      newErrors.pincode = "Pincode must be exactly 6 digits.";
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
                  className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                >
                  <HiCloudUpload className="w-4 h-4 text-orange-500" />
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(fieldName)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
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
            {initialData ? "Edit Party Worker Details" : "Party Worker Registration Form"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {initialData ? "Update registered party worker details" : "Register new party workers for organizational and booth levels"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiUser className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">1. Personal Details</h2>
          </div>
          {renderFileUpload("Party Worker Photo", "photo")}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput("First Name *", "firstName", "text", "e.g. John")}
            {renderInput("Middle Name", "middleName", "text", "e.g. Robert")}
            {renderInput("Last Name *", "lastName", "text", "e.g. Doe")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Date of Birth", "DOB", "date")}
            {renderSelect("Marital Status", "maritalStatus", MARITAL_STATUSES)}
          </div>
        </div>

        {/* Section 2: Address & Contacts */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiMap className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">2. Address & Contacts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Primary Mobile *", "primaryPhone", "tel", "e.g. 9876543210")}
            {renderInput("Alternative Mobile", "alternativePhone", "tel", "e.g. 9876543210")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput("House No.", "houseNo", "text", "e.g. H-12")}
            {renderInput("Street / Road", "street", "text", "e.g. Main Street")}
            {renderInput("Village / City", "village", "text", "e.g. Springfield")}
            {renderInput("Taluka", "taluka", "text", "e.g. North Side")}
            {renderInput("District", "district", "text", "e.g. Capital City")}
            {renderInput("Pincode", "pincode", "number", "e.g. 411033")}
          </div>
        </div>

        {/* Section 3: Organization Details */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiBriefcase className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">3. Position & Area</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect("Position *", "position", POSITIONS)}
            {renderInput("Area Name / Booth", "areaNameOrBooth", "text", "e.g. Booth No. 145 or Ward 12")}
          </div>
        </div>

        {/* Section 4: Family Details */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiHeart className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">4. Family Details</h2>
          </div>
          {formData.maritalStatus === "Married" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("Spouse Name", "spouseName", "text", "e.g. Jane Doe")}
              {renderInput("Spouse DOB", "spouseDOB", "date")}
              {renderInput("Anniversary Date", "anniversaryDate", "date")}
            </div>
          )}
          <div className="border-t border-orange-50 pt-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Parents Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Father Name", "fatherName", "text", "e.g. Robert Doe")}
              {renderInput("Father DOB", "fatherDOB", "date")}
              {renderInput("Mother Name", "motherName", "text", "e.g. Mary Doe")}
              {renderInput("Mother DOB", "motherDOB", "date")}
              <div className="md:col-span-2">
                {renderInput("Parents Anniversary Date", "parentsAnniversaryDate", "date")}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-orange-500/25 text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {initialData ? "Updating..." : "Registering..."}
              </>
            ) : (
              <>
                <HiSave className="w-5 h-5" />
                {initialData ? "Save Changes" : "Submit"}
              </>
            )}
          </button>
        </div>
      </form>

      {activeCameraField && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-orange-100 flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
                <HiCamera className="w-5 h-5 text-orange-500" />
                Capture Photo
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
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
    </div>
  );
}
