import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiCamera, HiCheckCircle, HiArrowLeft, HiArrowRight, HiCloudUpload } from "react-icons/hi";

const Form = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    photos: "", fullName: "", email: "", phoneNo: "", age: "", sex: "", DOB: "", aadharVoter: "",
    houseNo: "", landmark: "", village: "", pincode: "",
    purpose: "",
    patiantName: "", hospitalName: "", trackingDoctor: "", reason: "",
    studentName: "", studentDOB: "", studentGender: "", studentCategory: "", studentPhoto: "",
    jobFullName: "", jobPosition: "", jobDepartment: "", jobLocation: "", jobSalary: "",
    employeeName: "", employeeId: "", employeeDepartment: "", employeeDesignation: "", employeeRDepartment: "", employeeRTransfer: "",
    schemeName: "", schemePApplication: "", schemeApplyDate: "", schemeMaritalStatus: "", schemeCategary: "", schemeAddhar: "",
    businessName: "", businessType: "", businessSector: "", businessRNo: "", businessDOE: "", businessGST: "", businessAddress: "",
    utilityServiceInstallation: "", utilityProblem: "",
    policeApplicationNo: "", policeApplicationDate: "", policeApplicationPlace: "", policeIncidentDetails: "", policeInvolveName: "", policeDeclaration: "", policePhoto: "",
    projectName: "", projectLocation: "", projectProblem: "",
    message: "",
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
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "user") {
      router.push("/login");
    }
  }, [router]);

  const calculateAge = (dobString) => {
    if (!dobString || !/^\d{4}-\d{2}-\d{2}$/.test(dobString)) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "";
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 && calculatedAge <= 100 ? calculatedAge.toString() : "";
  };

  const handleTextChange = useCallback((name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "DOB") {
        updated.age = calculateAge(value);
      }
      return updated;
    });

    setErrors((prev) => {
      const updated = { ...prev, [name]: "" };
      if (name === "DOB") {
        updated.age = "";
      }
      if (name === "purpose") {
        const purposeFields = [
          "patiantName", "hospitalName", "trackingDoctor", "reason",
          "studentName", "studentDOB", "studentGender", "studentCategory", "studentPhoto",
          "jobFullName", "jobPosition", "jobDepartment", "jobLocation", "jobSalary",
          "employeeName", "employeeId", "employeeDepartment", "employeeDesignation", "employeeRDepartment", "employeeRTransfer",
          "schemeName", "schemePApplication", "schemeApplyDate", "schemeMaritalStatus", "schemeCategary", "schemeAddhar",
          "businessName", "businessType", "businessSector", "businessRNo", "businessDOE", "businessGST", "businessAddress",
          "utilityServiceInstallation", "utilityProblem",
          "policeApplicationNo", "policeApplicationDate", "policeApplicationPlace", "policeIncidentDetails", "policeInvolveName", "policeDeclaration", "policePhoto",
          "projectName", "projectLocation", "projectProblem"
        ];
        purposeFields.forEach((f) => {
          updated[f] = "";
        });
      }
      return updated;
    });
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

  // Bind video stream once the video element is mounted and stream is initialized
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeCameraField]);

  // Clean up camera stream on unmount or stream change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Revisit Pre-fill Logic
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
        let formattedDOB = "";
        if (data.DOB) {
          formattedDOB = new Date(data.DOB).toISOString().split("T")[0];
        }

        setFormData((prev) => {
          const updated = {
            ...prev,
            ...data,
            DOB: formattedDOB,
            purpose: "",
          };
          updated.age = calculateAge(formattedDOB);
          return updated;
        });

        setFoundVisitorName(data.fullName || "");
        setErrors({});
        toast.success(`Welcome back, ${data.fullName}! Your details have been filled.`);
      } else {
        setFoundVisitorName("");
        toast.error(data.error || "No record found. Please register as a new visitor.");
      }
    } catch (error) {
      console.error("Error looking up returning visitor:", error);
      setFoundVisitorName("");
      toast.error("Error looking up details. Please fill details manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = "Full name is required.";
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "Full name must be at least 3 characters.";
      } else if (!/^[A-Za-z\s]+$/.test(formData.fullName.trim())) {
        newErrors.fullName = "Name must only contain English letters and spaces.";
      }

      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = "Please enter a valid email address.";
        }
      }

      if (!formData.phoneNo || !formData.phoneNo.trim()) {
        newErrors.phoneNo = "Phone number is required.";
      } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
        newErrors.phoneNo = "Phone number must be exactly 10 digits.";
      }

      if (!formData.age || formData.age.toString().trim() === "") {
        newErrors.age = "Age is required.";
      } else {
        const parsedAge = parseInt(formData.age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 100) {
          newErrors.age = "Age must be between 1 and 100.";
        }
      }

      if (!formData.sex) {
        newErrors.sex = "Gender is required.";
      }

      if (!formData.DOB) {
        newErrors.DOB = "Date of birth is required.";
      } else {
        const dobDate = new Date(formData.DOB);
        const today = new Date();
        if (dobDate > today) {
          newErrors.DOB = "Date of birth cannot be in the future.";
        } else {
          let calculatedAge = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            calculatedAge--;
          }
          if (calculatedAge > 100) {
            newErrors.DOB = "Date of birth cannot be more than 100 years ago.";
          }
        }
      }

      if (formData.aadharVoter && formData.aadharVoter.trim() !== "") {
        const val = formData.aadharVoter.trim();
        if (/^\d+$/.test(val)) {
          if (val.length !== 12) {
            newErrors.aadharVoter = "Aadhaar Card must be exactly 12 digits.";
          }
        } else if (val.length < 5) {
          newErrors.aadharVoter = "Please enter a valid Aadhaar or Voter ID.";
        }
      }
    }

    if (step === 2) {
      if (!formData.houseNo || !formData.houseNo.trim()) {
        newErrors.houseNo = "House number is required.";
      }
      if (!formData.village || !formData.village.trim()) {
        newErrors.village = "Village / City is required.";
      }
      if (!formData.pincode || !formData.pincode.toString().trim()) {
        newErrors.pincode = "Pincode is required.";
      } else if (!/^\d{6}$/.test(formData.pincode.toString().trim())) {
        newErrors.pincode = "Pincode must be exactly 6 digits.";
      }
    }

    if (step === 3) {
      if (!formData.purpose) {
        newErrors.purpose = "Purpose of visit is required.";
      } else {
        switch (formData.purpose) {
          case "medical":
            if (!formData.patiantName || !formData.patiantName.trim()) newErrors.patiantName = "Patient name is required.";
            if (!formData.hospitalName || !formData.hospitalName.trim()) newErrors.hospitalName = "Hospital name is required.";
            if (!formData.trackingDoctor || !formData.trackingDoctor.trim()) newErrors.trackingDoctor = "Doctor name is required.";
            if (!formData.reason || !formData.reason.trim()) newErrors.reason = "Reason for visit is required.";
            break;
          case "education":
            if (!formData.studentName || !formData.studentName.trim()) newErrors.studentName = "Student name is required.";
            if (!formData.studentDOB) newErrors.studentDOB = "Student date of birth is required.";
            if (!formData.studentGender) newErrors.studentGender = "Student gender is required.";
            if (!formData.studentCategory || !formData.studentCategory.trim()) newErrors.studentCategory = "Caste category is required.";
            break;
          case "job": {
            const hasJobAppField = [
              formData.jobFullName,
              formData.jobPosition,
              formData.jobDepartment,
              formData.jobLocation,
              formData.jobSalary
            ].some(val => val && val.trim() !== "");

            const hasEmployeeField = [
              formData.employeeName,
              formData.employeeId,
              formData.employeeDepartment,
              formData.employeeDesignation,
              formData.employeeRDepartment,
              formData.employeeRTransfer
            ].some(val => val && val.trim() !== "");

            if (!hasJobAppField && !hasEmployeeField) {
              newErrors.jobFullName = "Please complete details for either Job Application or Employee Transfer.";
              newErrors.employeeName = "Please complete details for either Job Application or Employee Transfer.";
            } else {
              if (hasJobAppField) {
                if (!formData.jobFullName || !formData.jobFullName.trim()) newErrors.jobFullName = "Full name is required.";
                if (!formData.jobPosition || !formData.jobPosition.trim()) newErrors.jobPosition = "Applied position is required.";
                if (!formData.jobDepartment || !formData.jobDepartment.trim()) newErrors.jobDepartment = "Department is required.";
                if (!formData.jobLocation || !formData.jobLocation.trim()) newErrors.jobLocation = "Preferred location is required.";
                if (!formData.jobSalary || !formData.jobSalary.toString().trim()) newErrors.jobSalary = "Expected salary is required.";
              }
              if (hasEmployeeField) {
                if (!formData.employeeName || !formData.employeeName.trim()) newErrors.employeeName = "Employee name is required.";
                if (!formData.employeeId || !formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required.";
                if (!formData.employeeDepartment || !formData.employeeDepartment.trim()) newErrors.employeeDepartment = "Department is required.";
                if (!formData.employeeDesignation || !formData.employeeDesignation.trim()) newErrors.employeeDesignation = "Designation is required.";
                if (!formData.employeeRDepartment || !formData.employeeRDepartment.trim()) newErrors.employeeRDepartment = "Requested department is required.";
                if (!formData.employeeRTransfer || !formData.employeeRTransfer.trim()) newErrors.employeeRTransfer = "Transfer details are required.";
              }
            }
            break;
          }
          case "schemes":
            if (!formData.schemeName || !formData.schemeName.trim()) newErrors.schemeName = "Scheme name is required.";
            if (!formData.schemeApplyDate) newErrors.schemeApplyDate = "Application date is required.";
            if (!formData.schemeMaritalStatus) newErrors.schemeMaritalStatus = "Marital status is required.";
            if (!formData.schemeCategary || !formData.schemeCategary.trim()) newErrors.schemeCategary = "Caste category is required.";
            break;
          case "business":
            if (!formData.businessName || !formData.businessName.trim()) newErrors.businessName = "Business name is required.";
            if (!formData.businessType || !formData.businessType.trim()) newErrors.businessType = "Business type is required.";
            if (!formData.businessSector || !formData.businessSector.trim()) newErrors.businessSector = "Business sector is required.";
            if (!formData.businessDOE) newErrors.businessDOE = "Establishment date is required.";
            if (!formData.businessAddress || !formData.businessAddress.trim()) newErrors.businessAddress = "Business address is required.";
            if (formData.businessGST && formData.businessGST.trim() !== "") {
              if (formData.businessGST.trim().length !== 15) {
                newErrors.businessGST = "GST number must be exactly 15 characters.";
              }
            }
            break;
          case "utility":
            if (!formData.utilityServiceInstallation || !formData.utilityServiceInstallation.trim()) newErrors.utilityServiceInstallation = "Service/utility type is required.";
            if (!formData.utilityProblem || !formData.utilityProblem.trim()) newErrors.utilityProblem = "Problem description is required.";
            break;
          case "police":
            if (!formData.policeApplicationNo || !formData.policeApplicationNo.trim()) newErrors.policeApplicationNo = "Complaint / application number is required.";
            if (!formData.policeApplicationDate) newErrors.policeApplicationDate = "Application date is required.";
            if (!formData.policeApplicationPlace || !formData.policeApplicationPlace.trim()) newErrors.policeApplicationPlace = "Application place is required.";
            if (!formData.policeIncidentDetails || !formData.policeIncidentDetails.trim()) newErrors.policeIncidentDetails = "Detailed incident description is required.";
            if (!formData.policeDeclaration || !formData.policeDeclaration.trim()) newErrors.policeDeclaration = "Declaration is required.";
            break;
          case "administrative":
            if (!formData.projectName || !formData.projectName.trim()) newErrors.projectName = "Project name is required.";
            if (!formData.projectLocation || !formData.projectLocation.trim()) newErrors.projectLocation = "Project location is required.";
            if (!formData.projectProblem || !formData.projectProblem.trim()) newErrors.projectProblem = "Problem description is required.";
            break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep !== totalSteps) {
      if (validateStep(currentStep)) {
        setCurrentStep((prev) => prev + 1);
      } else {
        toast.error("Please fill in all required fields correctly.");
      }
      return;
    }

    let allStepsValid = true;
    let firstFailedStep = null;
    
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        allStepsValid = false;
        if (firstFailedStep === null) {
          firstFailedStep = step;
        }
      }
    }
    
    if (!allStepsValid) {
      setCurrentStep(firstFailedStep);
      toast.error(`Please fix errors in Step ${firstFailedStep} before submitting.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const addedBy = localStorage.getItem("username") || "";
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

  const stepLabels = ["Personal Info", "Address", "Purpose of Visit", "Review"];

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
            hasError
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
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
            hasError
              ? "border-red-500 focus:ring-red-500/20"
              : "border-slate-200 focus:ring-orange-500/20"
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
            hasError
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
          }`}
        >
          <option value="">Select {label}</option>
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
      <div>
        <label className={labelClass}>{label}</label>
        <div className="relative">
          {formData[fieldName] ? (
            <div className="max-w-sm mx-auto space-y-3">
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
                  className="flex-1 py-2.5 px-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-xs text-slate-700 font-semibold shadow-sm"
                >
                  <HiCloudUpload className="w-4 h-4 text-orange-500" />
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(fieldName)}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-orange-500/10"
                >
                  <HiCamera className="w-4 h-4" />
                  Use Camera
                </button>
              </div>
            </div>
          ) : (
            <div className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
              hasError
                ? "border-red-500 bg-red-50/10"
                : "border-slate-200 bg-slate-50/50 hover:bg-orange-50/10"
            }`}>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${fieldName}`).click()}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm text-slate-700 font-semibold shadow-sm"
                >
                  <HiCloudUpload className="w-5 h-5 text-orange-500" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(fieldName)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-orange-500/10"
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

  const renderPurposeFields = () => {
    switch (formData.purpose) {
      case "medical":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Patient Name", "patiantName", "text", "e.g. John Doe")}
            {renderInput("Hospital Name", "hospitalName", "text", "e.g. City Hospital")}
            {renderInput("Doctor Name", "trackingDoctor", "text", "e.g. Dr. Davis")}
            {renderInput("Reason for Visit", "reason", "text", "e.g. Medical Checkup")}
          </div>
        );
      case "education":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Student Name", "studentName", "text", "e.g. John Doe")}
              {renderInput("Student Date of Birth", "studentDOB", "date")}
              {renderSelect("Student Gender", "studentGender", [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ])}
              {renderInput("Caste Category", "studentCategory", "text", "e.g. General / OBC / SC / ST")}
            </div>
            {renderFileUpload("Student Photo", "studentPhoto")}
          </div>
        );
      case "job":
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1">Job Application</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Candidate Full Name", "jobFullName", "text", "e.g. John Doe")}
              {renderInput("Applied Position", "jobPosition", "text", "e.g. Software Engineer")}
              {renderInput("Department", "jobDepartment", "text", "e.g. IT")}
              {renderInput("Preferred Location", "jobLocation", "text", "e.g. Springfield")}
              {renderInput("Expected Salary", "jobSalary", "number", "e.g. 50000")}
            </div>
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1 pt-2">Employee Transfer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Employee Name", "employeeName", "text", "e.g. Jane Doe")}
              {renderInput("Employee ID", "employeeId", "text", "e.g. EMP123")}
              {renderInput("Department", "employeeDepartment", "text", "e.g. Sales")}
              {renderInput("Designation", "employeeDesignation", "text", "e.g. Executive")}
              {renderInput("Requested Department", "employeeRDepartment", "text", "e.g. Marketing")}
              {renderInput("Transfer Location/Details", "employeeRTransfer", "text", "e.g. North Branch")}
            </div>
          </div>
        );
      case "schemes":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Scheme Name", "schemeName", "text", "e.g. Prime Minister Scheme")}
            {renderInput("Previous Application Details", "schemePApplication", "text", "e.g. Applied in 2025")}
            {renderInput("Application Date", "schemeApplyDate", "date")}
            {renderSelect("Marital Status", "schemeMaritalStatus", [
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "divorced", label: "Divorced" },
              { value: "widowed", label: "Widowed" },
            ])}
            {renderInput("Caste Category", "schemeCategary", "text", "e.g. General")}
            {renderInput("Aadhaar Card Number", "schemeAddhar", "text", "e.g. 123456789012")}
          </div>
        );
      case "business":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Business Name", "businessName", "text", "e.g. Acme Corp")}
            {renderInput("Business Type", "businessType", "text", "e.g. Retail")}
            {renderInput("Business Sector", "businessSector", "text", "e.g. Consumer Goods")}
            {renderInput("Registration Number", "businessRNo", "text", "e.g. REG123456")}
            {renderInput("Establishment Date", "businessDOE", "date")}
            {renderInput("GST Number", "businessGST", "text", "e.g. 27AAAAA0000A1Z5")}
            <div className="md:col-span-2">
              {renderInput("Business Address", "businessAddress", "text", "e.g. 123 Business Rd")}
            </div>
          </div>
        );
      case "utility":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Service / Utility Type", "utilityServiceInstallation", "text", "e.g. Water Connection")}
            {renderInput("Problem Description", "utilityProblem", "text", "e.g. Low water pressure")}
          </div>
        );
      case "police":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Complaint / Application No.", "policeApplicationNo", "text", "e.g. POL98765")}
              {renderInput("Application Date", "policeApplicationDate", "date")}
              {renderInput("Application Place", "policeApplicationPlace", "text", "e.g. Main Police Station")}
              {renderInput("Involved Person Name", "policeInvolveName", "text", "e.g. Robert Smith")}
            </div>
            {renderTextarea("Incident Details", "policeIncidentDetails", "Write detailed incident description here...")}
            {renderTextarea("Self Declaration", "policeDeclaration", "Write your self declaration here...")}
            {renderFileUpload("Incident Proof or Photo", "policePhoto")}
          </div>
        );
      case "administrative":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Project Name", "projectName", "text", "e.g. Bridge Construction")}
            {renderInput("Project Location", "projectLocation", "text", "e.g. East River")}
            <div className="md:col-span-2">
              {renderTextarea("Problem Description", "projectProblem", "Write detailed problem description here...")}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            {/* Returning Visitor Pre-fill Lookup Panel */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h4 className="text-slate-800 font-bold text-sm">Returning Visitor?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quickly fill your details using your registered phone number.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  placeholder="Enter registered phone number..."
                  value={searchPhone}
                  onChange={(e) => {
                    setSearchPhone(e.target.value);
                    if (foundVisitorName) {
                      setFoundVisitorName("");
                    }
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
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Find Details"
                  )}
                </button>
              </div>
              {foundVisitorName && (
                <div className="mt-3 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 animate-fade-in shadow-sm">
                  <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-slate-600">Found Name: </span>
                    <strong className="text-slate-800 font-bold">{foundVisitorName}</strong>
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
            {renderFileUpload("Photo", "photos")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Full Name *", "fullName", "text", "e.g. John Doe")}
              {renderInput("Email", "email", "email", "e.g. john@example.com")}
              {renderInput("Phone Number *", "phoneNo", "tel", "e.g. 9876543210")}
              {renderInput("Age *", "age", "number", "e.g. 30")}
              {renderSelect("Gender *", "sex", [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ])}
              {renderInput("Date of Birth *", "DOB", "date")}
              {renderInput("Aadhaar / Voter ID", "aadharVoter", "text", "Aadhaar Card or Voter ID")}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("House Number *", "houseNo", "text", "e.g. H-12")}
              {renderInput("Landmark", "landmark", "text", "e.g. Near Temple")}
              {renderInput("Village / City *", "village", "text", "e.g. Springfield")}
              {renderInput("Pincode *", "pincode", "number", "e.g. 411033")}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Purpose of Visit</h3>
            {renderSelect("Purpose *", "purpose", [
              { value: "medical", label: "Medical Assistance" },
              { value: "education", label: "Education" },
              { value: "job", label: "Job" },
              { value: "schemes", label: "Government Schemes" },
              { value: "business", label: "Business" },
              { value: "utility", label: "Utility Service" },
              { value: "police", label: "Police Complaint/Application" },
              { value: "administrative", label: "Administrative Work" },
            ])}
            {renderPurposeFields()}
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Review and Submit</h3>
            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl text-green-600 flex-shrink-0">
                  <HiCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-green-800 font-bold text-base">Visitor Registered Successfully!</h4>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    Registration has been completed successfully. You can review the details below.
                  </p>
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Additional Message or Remarks</label>
              <textarea
                name="message"
                disabled={isSubmitted}
                rows={4}
                value={formData.message || ""}
                onChange={handleChange}
                className={`${inputClass} resize-none ${isSubmitted ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100" : ""}`}
                placeholder="Write any additional message or remarks here..."
              />
            </div>
            <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 space-y-3">
              <h4 className="text-slate-800 font-bold text-sm mb-3">Registration Summary</h4>
              {formData.photos && (
                <div className="flex justify-center mb-4">
                  <img src={formData.photos} alt="Visitor" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Name", formData.fullName],
                  ["Email", formData.email],
                  ["Phone Number", formData.phoneNo],
                  ["Age", formData.age],
                  ["Gender", formData.sex === "male" ? "Male" : formData.sex === "female" ? "Female" : formData.sex === "other" ? "Other" : formData.sex],
                  ["Date of Birth", formData.DOB],
                  ["Aadhaar / Voter ID", formData.aadharVoter],
                  ["House Number", formData.houseNo],
                  ["Landmark", formData.landmark],
                  ["Village / City", formData.village],
                  ["Pincode", formData.pincode],
                  ["Purpose of Visit", formData.purpose === "medical" ? "Medical Assistance" : formData.purpose === "education" ? "Education" : formData.purpose === "job" ? "Job" : formData.purpose === "schemes" ? "Government Schemes" : formData.purpose === "business" ? "Business" : formData.purpose === "utility" ? "Utility Service" : formData.purpose === "police" ? "Police Complaint/Application" : formData.purpose === "administrative" ? "Administrative Work" : formData.purpose],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label} className="flex justify-between py-1 border-b border-orange-100/30">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-800 font-medium capitalize">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
              {formData.message && (
                <div className="pt-2 border-t border-orange-100/50">
                  <span className="text-slate-500 text-sm">Message/Remarks: </span>
                  <span className="text-slate-800 text-sm">{formData.message}</span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 p-5 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl pt-3 md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Visitor Registration
            </h1>
            <p className="text-slate-500 mt-2 ">Complete all steps to register a new visitor</p>
          </div>

          <div className="flex items-center justify-between px-2">
            {stepLabels.map((label, index) => {
              const step = index + 1;
              const isCompleted = isSubmitted || currentStep > step;
              const isCurrent = !isSubmitted && currentStep === step;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-sm"
                          : isCurrent
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isCompleted ? <HiCheckCircle className="w-6 h-6" /> : step}
                    </div>
                    <span
                      className={`text-xs mt-1.5 hidden sm:block ${
                        isCurrent ? "text-orange-600 font-semibold" : isCompleted ? "text-green-600 font-medium" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              {renderStep()}
            </div>

            <div className="flex justify-between mt-6">
              {isSubmitted ? (
                <>
                  <div />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        photos: "", fullName: "", email: "", phoneNo: "", age: "", sex: "", DOB: "", aadharVoter: "",
                        houseNo: "", landmark: "", village: "", pincode: "",
                        purpose: "",
                        patiantName: "", hospitalName: "", trackingDoctor: "", reason: "",
                        studentName: "", studentDOB: "", studentGender: "", studentCategory: "", studentPhoto: "",
                        jobFullName: "", jobPosition: "", jobDepartment: "", jobLocation: "", jobSalary: "",
                        employeeName: "", employeeId: "", employeeDepartment: "", employeeDesignation: "", employeeRDepartment: "", employeeRTransfer: "",
                        schemeName: "", schemePApplication: "", schemeApplyDate: "", schemeMaritalStatus: "", schemeCategary: "", schemeAddhar: "",
                        businessName: "", businessType: "", businessSector: "", businessRNo: "", businessDOE: "", businessGST: "", businessAddress: "",
                        utilityServiceInstallation: "", utilityProblem: "",
                        policeApplicationNo: "", policeApplicationDate: "", policeApplicationPlace: "", policeIncidentDetails: "", policeInvolveName: "", policeDeclaration: "", policePhoto: "",
                        projectName: "", projectLocation: "", projectProblem: "",
                        message: "",
                      });
                      setSearchPhone("");
                      setFoundVisitorName("");
                      setErrors({});
                      setIsSubmitted(false);
                      setCurrentStep(1);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
                  >
                    Register Another Visitor
                  </button>
                </>
              ) : (
                <>
                  {currentStep > 1 ? (
                    <button
                      key="prev-button"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      key="next-button"
                      type="button"
                      onClick={() => {
                        if (validateStep(currentStep)) {
                          setCurrentStep((prev) => prev + 1);
                        } else {
                          toast.error("Please fill in all required fields correctly.");
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/10"
                    >
                      Next
                      <HiArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      key="submit-button"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Registration"
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
      </div>

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
    </>
  );
};

export default Form;
