import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { HiMail, HiUser, HiPhone, HiCalendar, HiArrowLeft, HiSave, HiCamera, HiCloudUpload } from "react-icons/hi";

export default function LetterForm({ initialData, onSubmit, isSubmitting, backPath = "/admin", createdBy = "admin" }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    photo: "",
    details: "",
    letterAddressedTo: "",
    subject: "",
    department: "",
    inwardNumber: "",
    assignedPerson: "",
    contactNumber: "",
    nextAction: "",
    followUpDate: "",
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
        details: initialData.details || "",
        letterAddressedTo: initialData.letterAddressedTo || "",
        subject: initialData.subject || "",
        department: initialData.department || "",
        inwardNumber: initialData.inwardNumber || "",
        assignedPerson: initialData.assignedPerson || "",
        contactNumber: initialData.contactNumber || "",
        nextAction: initialData.nextAction || "",
        followUpDate: formatInputDate(initialData.followUpDate),
      });
    }
  }, [initialData]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject || !formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }
    if (!formData.inwardNumber || !formData.inwardNumber.trim()) {
      newErrors.inwardNumber = "Inward number is required.";
    }
    if (formData.contactNumber && formData.contactNumber.trim() && !/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits.";
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

  const renderTextarea = (label, name, placeholder = "") => {
    const hasError = !!errors[name];

    return (
      <div>
        <label className={labelClass}>{label}</label>
        <textarea
          name={name}
          rows={3}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={placeholder || "Enter details"}
          className={`${inputClass} resize-none ${
            hasError ? "border-red-500 focus:ring-red-500/20" : ""
          }`}
        />
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
            <div className="relative group max-w-xs">
              <img
                src={formData[fieldName]}
                alt="Preview"
                className={`w-full h-40 object-cover rounded-xl border ${
                  hasError ? "border-red-500" : "border-orange-100"
                }`}
              />
              <div
                className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => document.getElementById(`file-${fieldName}`).click()}
              >
                <HiCamera className="w-8 h-8 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={`w-full max-w-xs h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/20 transition-all duration-300 ${
                hasError
                  ? "border-red-500 hover:border-red-500/50"
                  : "border-slate-200 hover:border-orange-500/50"
              }`}
              onClick={() => document.getElementById(`file-${fieldName}`).click()}
            >
              <HiCloudUpload className={`w-10 h-10 mb-2 ${hasError ? "text-red-400" : "text-slate-400"}`} />
              <p className={`text-sm ${hasError ? "text-red-500" : "text-slate-500"}`}>Click to upload</p>
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
            {initialData ? "Edit Letter Details" : "Letter Registration Form"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {initialData ? "Update registered letter details" : "Register inward letters and details associated with them"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Letter Document Upload */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiCamera className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">1. Letter Image / Proof (Letter Document)</h2>
          </div>
          {renderFileUpload("Document Photo", "photo")}
        </div>

        {/* Section 2: Core Details */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiMail className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">2. Core Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Subject *", "subject", "text", "e.g. Road Repair Request")}
            {renderInput("Inward Number *", "inwardNumber", "text", "e.g. IN/2026/102")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Letter Addressed To", "letterAddressedTo", "text", "e.g. Municipal Commissioner")}
            {renderInput("Department / Account", "department", "text", "e.g. Construction Department")}
          </div>
          {renderTextarea("Details / Description", "details", "Detailed description of the letter or remarks...")}
        </div>

        {/* Section 3: Assignment & Actions */}
        <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-orange-50">
            <HiUser className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-800">3. Assignment & Follow-up</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Assigned Person", "assignedPerson", "text", "e.g. Robert Smith")}
            {renderInput("Contact Number", "contactNumber", "tel", "e.g. 9876543210")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput("Next Action / Status", "nextAction", "text", "e.g. Follow-up in progress")}
            {renderInput("Next Follow-up Date", "followUpDate", "date")}
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
    </div>
  );
}
