import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiCamera as HiCameraIcon, HiCloudUpload as HiCloudUploadIcon, HiCheckCircle, HiArrowLeft } from "react-icons/hi";

const AddVisitor = () => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    photos: "",
    fullName: "",
    phoneNo: "",
    visitMode: "In the office",
    sex: "",
    address: "",
    purpose: "",
    subPurpose: "",
    customPurpose: "",
    customSubPurpose: "",
  });

  const [errors, setErrors] = useState({});

  // Revisit Lookup States
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundVisitorName, setFoundVisitorName] = useState("");

  const [activeCameraField, setActiveCameraField] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);

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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "purpose") {
        updated.subPurpose = "";
        updated.customPurpose = "";
        updated.customSubPurpose = "";
      } else if (name === "subPurpose") {
        updated.customSubPurpose = "";
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

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

  // Revisit Lookup
  const handleRevisitLookup = async () => {
    if (!searchPhone) {
      toast.warning("Please enter a phone number to search.");
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/lookup-visitor?phone=${encodeURIComponent(searchPhone)}`);
      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          fullName: data.fullName || "",
          phoneNo: data.phoneNo || searchPhone,
          sex: data.sex || "",
          address: data.address || "",
          photos: data.photos || "",
          purpose: "",
          subPurpose: "",
          customPurpose: "",
          customSubPurpose: "",
        }));

        setFoundVisitorName(data.fullName || "");
        setErrors({});
        toast.success(`Welcome back, ${data.fullName}! Details have been pre-filled. Please select the purpose of this visit.`);
      } else {
        setFormData({
          photos: "",
          fullName: "",
          phoneNo: searchPhone,
          sex: "",
          address: "",
          purpose: "",
          subPurpose: "",
          customPurpose: "",
          customSubPurpose: "",
        });
        setFoundVisitorName("");
        toast.error(data.error || "No record found. Please register as a new visitor.");
      }
    } catch (error) {
      console.error("Error looking up returning visitor:", error);
      setFormData({
        photos: "",
        fullName: "",
        phoneNo: searchPhone,
        sex: "",
        address: "",
        purpose: "",
        subPurpose: "",
        customPurpose: "",
        customSubPurpose: "",
      });
      setFoundVisitorName("");
      toast.error("Error looking up details. Please fill details manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      photos: "",
      fullName: "",
      phoneNo: "",
      visitMode: "In the office",
      sex: "",
      address: "",
      purpose: "",
      subPurpose: "",
      customPurpose: "",
      customSubPurpose: "",
    });
    setSearchPhone("");
    setFoundVisitorName("");
    setErrors({});
    toast.info("Form cleared.");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = "Name must only contain English letters and spaces.";
    }

    if (!formData.phoneNo || !formData.phoneNo.trim()) {
      newErrors.phoneNo = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
      newErrors.phoneNo = "Phone number must be exactly 10 digits.";
    }

    if (!formData.address || !formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.purpose) {
      newErrors.purpose = "Nature of work is required.";
    } else {
      if (formData.purpose === "DRAINAGE" && !formData.subPurpose) {
        newErrors.subPurpose = "Drainage sub-type is required.";
      }
      if (formData.purpose === "Other" && (!formData.customPurpose || !formData.customPurpose.trim())) {
        newErrors.customPurpose = "Please specify nature of work.";
      }
      if (formData.purpose === "DRAINAGE" && formData.subPurpose === "Other" && (!formData.customSubPurpose || !formData.customSubPurpose.trim())) {
        newErrors.customSubPurpose = "Please specify drainage details.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const addedBy = localStorage.getItem("username") || "admin";
      const payload = { ...formData, addedBy };
      const res = await fetch("/api/addform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Visitor registered successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "Failed to submit registration.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  return (
    <>
      <Head>
        <title>Add Visitor – VisitorPass Admin</title>
        <meta name="description" content="Register a new visitor in the admin database." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 p-5 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/visitorTable")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Add Visitor
              </h1>
              <p className="text-slate-500 text-sm mt-1">Register a new visitor</p>
            </div>
          </div>

          {/* Lookup Panel */}
          {!isSubmitted && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
              <div>
                <h4 className="text-slate-800 font-bold text-sm">Returning Visitor?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quickly fill details using a registered phone number.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  placeholder="Enter registered phone number..."
                  value={searchPhone}
                  onChange={(e) => {
                    setSearchPhone(e.target.value);
                    if (foundVisitorName) setFoundVisitorName("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRevisitLookup();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={handleRevisitLookup}
                  disabled={isSearching || !searchPhone}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto"
                >
                  {isSearching ? "Searching..." : "Find Details"}
                </button>
              </div>
              {foundVisitorName && (
                <div className="mt-3 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                  <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-slate-600">Found Name: </span>
                    <strong className="text-slate-800 font-bold">{foundVisitorName}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {isSubmitted ? (
            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <HiCheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="text-green-800 font-bold text-base">Visitor Registered Successfully!</h4>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    The registration entry has been added to the database.
                  </p>
                </div>
              </div>

              <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 space-y-3">
                <h4 className="text-slate-800 font-bold text-sm mb-3">Registration Summary</h4>
                {formData.photos && (
                  <div className="flex justify-center mb-4">
                    <img src={formData.photos} alt="Visitor" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  {[
                    ["Name", formData.fullName],
                    ["Phone Number", formData.phoneNo],
                    ["Gender", formData.sex === "male" ? "Male" : formData.sex === "female" ? "Female" : formData.sex === "other" ? "Other" : formData.sex],
                    ["Address", formData.address],
                    ["Purpose of Visit", formData.purpose],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="flex justify-between py-1 border-b border-orange-100/30">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[250px]">{value}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/visitorTable")}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all"
                >
                  View All Visitors
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      photos: "",
                      fullName: "",
                      phoneNo: "",
                      sex: "",
                      address: "",
                      purpose: "",
                      subPurpose: "",
                      customPurpose: "",
                      customSubPurpose: "",
                    });
                    setSearchPhone("");
                    setFoundVisitorName("");
                    setErrors({});
                    setIsSubmitted(false);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
                >
                  Register Another Visitor
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                {/* 1. Full Name */}
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`${inputClass} ${errors.fullName ? "border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* 2. Phone */}
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className={`${inputClass} ${errors.phoneNo ? "border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                  {errors.phoneNo && <p className="text-xs text-red-500 mt-1">{errors.phoneNo}</p>}
                </div>

                {/* Mode of Interaction Dropdown */}
                <div>
                  <label className={labelClass}>Mode of Visit / Interaction</label>
                  <select
                    name="visitMode"
                    value={formData.visitMode}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="In the office">In the office</option>
                    <option value="On Field">On Field</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                {/* 3. Purpose / Nature of Work */}
                <div>
                  <label className={labelClass}>Nature of Work *</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.purpose ? "border-red-500 focus:ring-red-500/20" : ""}`}
                  >
                    <option value="">Select </option>
                    <option value="MEET WITH DADA">MEET WITH DADA</option>
                    <option value="ROAD">ROAD</option>
                    <option value="FOOTPATH">FOOTPATH</option>
                    <option value="DRAINAGE">DRAINAGE</option>
                    <option value="WATER">WATER</option>
                    <option value="STORM WATER CRISIS">STORM WATER CRISIS</option>
                    <option value="WASTE MANAGEMENT">WASTE MANAGEMENT</option>
                    <option value="FOLLIAGE MANAGEMENT">FOLLIAGE MANAGEMENT</option>
                    <option value="DEBRIS MANAGEMENT">DEBRIS MANAGEMENT</option>
                    <option value="TREE CUTTING">TREE CUTTING</option>
                    <option value="STREET LIGHTS">STREET LIGHTS</option>
                    <option value="DEATH INTIMATION LETTER">DEATH INTIMATION LETTER</option>
                    <option value="JOB REFERENCE LETTER">JOB REFERENCE LETTER</option>
                    <option value="MSEB">MSEB</option>
                    <option value="BIRTH & DEATH CERTIFICATE CORRECTION">BIRTH & DEATH CERTIFICATE CORRECTION</option>
                    <option value="RECOMONDATION LETTER">RECOMONDATION LETTER</option>
                    <option value="ADMISSION LETTER">ADMISSION LETTER</option>
                    <option value="toilet">toilet</option>
                    <option value="medical assit.">medical assit.</option>
                    <option value="ambulance">ambulance</option>
                    <option value="ration kit">ration kit</option>
                    <option value="Monitery Help">Monitery Help</option>
                    <option value="chairty">chairty</option>
                    <option value="in kind help">in kind help</option>
                    <option value="tanker">tanker</option>
                    <option value="SCHOOL / COLLEGE FEE LETTER">SCHOOL / COLLEGE FEE LETTER</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
                </div>

                {/* Nature of Work details optional/required input */}
                {formData.purpose && formData.purpose !== "DRAINAGE" && (
                  <div className="mt-4 animate-fade-in">
                    <label className={labelClass}>
                      Nature of Work Details {formData.purpose === "Other" ? "(Required) *" : "(Optional)"}
                    </label>
                    <input
                      type="text"
                      name="customPurpose"
                      value={formData.customPurpose}
                      onChange={handleChange}
                      placeholder={formData.purpose === "Other" ? "Please specify details" : "Enter additional details if any"}
                      className={`${inputClass} ${errors.customPurpose ? "border-red-500 focus:ring-red-500/20" : ""}`}
                    />
                    {errors.customPurpose && <p className="text-xs text-red-500 mt-1">{errors.customPurpose}</p>}
                  </div>
                )}

                {/* Drainage Sub-dropdown */}
                {formData.purpose === "DRAINAGE" && (
                  <div className="mt-4 animate-fade-in">
                    <label className={labelClass}>Drainage Sub-Type *</label>
                    <select
                      name="subPurpose"
                      value={formData.subPurpose}
                      onChange={handleChange}
                      className={`${inputClass} ${errors.subPurpose ? "border-red-500 focus:ring-red-500/20" : ""}`}
                    >
                      <option value="">Select Sub-Type</option>
                      <option value="ROUND CHAMBER">ROUND CHAMBER</option>
                      <option value="RECTANGLE CHAMBER">RECTANGLE CHAMBER</option>
                      <option value="LINE CHANGE">LINE CHANGE</option>
                      <option value="REPAIR WORK">REPAIR WORK</option>
                      <option value="JETTING REQUIRED">JETTING REQUIRED</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subPurpose && <p className="text-xs text-red-500 mt-1">{errors.subPurpose}</p>}
                  </div>
                )}

                {/* Custom/Optional Drainage subtype Details Text Input */}
                {formData.purpose === "DRAINAGE" && formData.subPurpose && (
                  <div className="mt-4 animate-fade-in">
                    <label className={labelClass}>
                      Drainage Details {formData.subPurpose === "Other" ? "(Required) *" : "(Optional)"}
                    </label>
                    <input
                      type="text"
                      name="customSubPurpose"
                      value={formData.customSubPurpose}
                      onChange={handleChange}
                      placeholder={formData.subPurpose === "Other" ? "Please specify details" : "Enter additional details if any"}
                      className={`${inputClass} ${errors.customSubPurpose ? "border-red-500 focus:ring-red-500/20" : ""}`}
                    />
                    {errors.customSubPurpose && <p className="text-xs text-red-500 mt-1">{errors.customSubPurpose}</p>}
                  </div>
                )}

                {/* 4. Address */}
                <div>
                  <label className={labelClass}>Address *</label>
                  <textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address details"
                    className={`${inputClass} resize-none ${errors.address ? "border-red-500 focus:ring-red-500/20" : ""}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* 5. Gender */}
                <div>
                  <label className={labelClass}>Gender (Optional)</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* 6. Photo Field */}
                <div>
                  <label className={labelClass}>Photo (Optional)</label>
                  <div className="relative">
                    {formData.photos ? (
                      <div className="max-w-sm mx-auto space-y-3">
                        <img
                          src={formData.photos}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-xl border border-orange-100"
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => document.getElementById("file-photos").click()}
                            className="flex-1 py-2.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                          >
                            <HiCloudUploadIcon className="w-4 h-4 text-orange-500" />
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => startCamera("photos")}
                            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
                          >
                            <HiCameraIcon className="w-4 h-4" />
                            Use Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-6 border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-orange-50/10 rounded-xl flex flex-col items-center justify-center transition-all duration-300">
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                          <button
                            type="button"
                            onClick={() => document.getElementById("file-photos").click()}
                            className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-700 font-semibold shadow-sm"
                          >
                            <HiCloudUploadIcon className="w-5 h-5 text-orange-500" />
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => startCamera("photos")}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-orange-500/10"
                          >
                            <HiCameraIcon className="w-5 h-5" />
                            Take Photo
                          </button>
                        </div>
                      </div>
                    )}
                    <input
                      id="file-photos"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "photos")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-orange-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {activeCameraField && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-orange-100 flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
                <HiCameraIcon className="w-5 h-5 text-orange-500" />
                Capture Photo
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200/50"
              >
                ✕
              </button>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
              {!cameraStream && !cameraError && (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
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
    </>
  );
};

export default AddVisitor;
