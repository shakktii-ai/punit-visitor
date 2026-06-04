import React, { useState, useEffect, useCallback } from "react";
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
    houseNo: "", landmark: "", village: "", state: "", nation: "", pincode: "",
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

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "user") {
      router.push("/login");
    }
  }, [router]);

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge.toString() : "";
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
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

        setFormData((prev) => ({
          ...prev,
          ...data,
          DOB: formattedDOB,
          purpose: "",
        }));

        setErrors({});
        toast.success(`Welcome back, ${data.fullName}! Your profile has been pre-filled.`);
        setCurrentStep(3);
      } else {
        toast.error(data.error || "No records found. Please register as a new visitor.");
      }
    } catch (error) {
      console.error("Error looking up returning visitor:", error);
      toast.error("An error occurred during lookup. Please fill manually.");
    } finally {
      setIsSearching(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName || !formData.fullName.trim()) {
        newErrors.fullName = "Full Name is required.";
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = "Full Name must be at least 3 characters.";
      } else if (!/^[A-Za-z\s]+$/.test(formData.fullName.trim())) {
        newErrors.fullName = "Full Name must contain only alphabets and spaces.";
      }

      if (formData.email && formData.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = "Please enter a valid email address.";
        }
      }

      if (!formData.phoneNo || !formData.phoneNo.trim()) {
        newErrors.phoneNo = "Phone Number is required.";
      } else if (!/^\d{10}$/.test(formData.phoneNo.trim())) {
        newErrors.phoneNo = "Phone Number must be exactly 10 digits.";
      }

      if (!formData.age || formData.age.toString().trim() === "") {
        newErrors.age = "Age is required.";
      } else {
        const parsedAge = parseInt(formData.age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
          newErrors.age = "Age must be between 1 and 120.";
        }
      }

      if (!formData.sex) {
        newErrors.sex = "Gender selection is required.";
      }

      if (!formData.DOB) {
        newErrors.DOB = "Date of Birth is required.";
      } else {
        const dobDate = new Date(formData.DOB);
        const today = new Date();
        if (dobDate > today) {
          newErrors.DOB = "Date of Birth cannot be in the future.";
        }
      }

      if (formData.aadharVoter && formData.aadharVoter.trim() !== "") {
        const val = formData.aadharVoter.trim();
        if (/^\d+$/.test(val)) {
          if (val.length !== 12) {
            newErrors.aadharVoter = "Aadhar Card must be exactly 12 digits.";
          }
        } else if (val.length < 5) {
          newErrors.aadharVoter = "Please enter a valid Aadhar or Voter ID.";
        }
      }
    }

    if (step === 2) {
      if (!formData.houseNo || !formData.houseNo.trim()) {
        newErrors.houseNo = "House No. is required.";
      }
      if (!formData.village || !formData.village.trim()) {
        newErrors.village = "Village / Town is required.";
      }
      if (!formData.state || !formData.state.trim()) {
        newErrors.state = "State is required.";
      }
      if (!formData.nation || !formData.nation.trim()) {
        newErrors.nation = "Nation is required.";
      }
      if (!formData.pincode || !formData.pincode.toString().trim()) {
        newErrors.pincode = "Pincode is required.";
      } else if (!/^\d{6}$/.test(formData.pincode.toString().trim())) {
        newErrors.pincode = "Pincode must be exactly 6 digits.";
      }
    }

    if (step === 3) {
      if (!formData.purpose) {
        newErrors.purpose = "Purpose of Visit is required.";
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
            if (!formData.studentDOB) newErrors.studentDOB = "Student Date of Birth is required.";
            if (!formData.studentGender) newErrors.studentGender = "Student Gender is required.";
            if (!formData.studentCategory || !formData.studentCategory.trim()) newErrors.studentCategory = "Category is required.";
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
              newErrors.jobFullName = "Please complete either Job Application or Employee Transfer.";
              newErrors.employeeName = "Please complete either Job Application or Employee Transfer.";
            } else {
              if (hasJobAppField) {
                if (!formData.jobFullName || !formData.jobFullName.trim()) newErrors.jobFullName = "Full Name is required.";
                if (!formData.jobPosition || !formData.jobPosition.trim()) newErrors.jobPosition = "Position is required.";
                if (!formData.jobDepartment || !formData.jobDepartment.trim()) newErrors.jobDepartment = "Department is required.";
                if (!formData.jobLocation || !formData.jobLocation.trim()) newErrors.jobLocation = "Preferred Location is required.";
                if (!formData.jobSalary || !formData.jobSalary.toString().trim()) newErrors.jobSalary = "Expected Salary is required.";
              }
              if (hasEmployeeField) {
                if (!formData.employeeName || !formData.employeeName.trim()) newErrors.employeeName = "Employee Name is required.";
                if (!formData.employeeId || !formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required.";
                if (!formData.employeeDepartment || !formData.employeeDepartment.trim()) newErrors.employeeDepartment = "Department is required.";
                if (!formData.employeeDesignation || !formData.employeeDesignation.trim()) newErrors.employeeDesignation = "Designation is required.";
                if (!formData.employeeRDepartment || !formData.employeeRDepartment.trim()) newErrors.employeeRDepartment = "Requested Department is required.";
                if (!formData.employeeRTransfer || !formData.employeeRTransfer.trim()) newErrors.employeeRTransfer = "Requested Transfer details are required.";
              }
            }
            break;
          }
          case "schemes":
            if (!formData.schemeName || !formData.schemeName.trim()) newErrors.schemeName = "Scheme Name is required.";
            if (!formData.schemeApplyDate) newErrors.schemeApplyDate = "Apply Date is required.";
            if (!formData.schemeMaritalStatus) newErrors.schemeMaritalStatus = "Marital Status is required.";
            if (!formData.schemeCategary || !formData.schemeCategary.trim()) newErrors.schemeCategary = "Category is required.";
            break;
          case "business":
            if (!formData.businessName || !formData.businessName.trim()) newErrors.businessName = "Business Name is required.";
            if (!formData.businessType || !formData.businessType.trim()) newErrors.businessType = "Business Type is required.";
            if (!formData.businessSector || !formData.businessSector.trim()) newErrors.businessSector = "Business Sector is required.";
            if (!formData.businessDOE) newErrors.businessDOE = "Date of Establishment is required.";
            if (!formData.businessAddress || !formData.businessAddress.trim()) newErrors.businessAddress = "Business Address is required.";
            if (formData.businessGST && formData.businessGST.trim() !== "") {
              if (formData.businessGST.trim().length !== 15) {
                newErrors.businessGST = "GST Number must be exactly 15 characters.";
              }
            }
            break;
          case "utility":
            if (!formData.utilityServiceInstallation || !formData.utilityServiceInstallation.trim()) newErrors.utilityServiceInstallation = "Service Installation is required.";
            if (!formData.utilityProblem || !formData.utilityProblem.trim()) newErrors.utilityProblem = "Problem Description is required.";
            break;
          case "police":
            if (!formData.policeApplicationNo || !formData.policeApplicationNo.trim()) newErrors.policeApplicationNo = "Application No. is required.";
            if (!formData.policeApplicationDate) newErrors.policeApplicationDate = "Application Date is required.";
            if (!formData.policeApplicationPlace || !formData.policeApplicationPlace.trim()) newErrors.policeApplicationPlace = "Application Place is required.";
            if (!formData.policeIncidentDetails || !formData.policeIncidentDetails.trim()) newErrors.policeIncidentDetails = "Incident Details are required.";
            if (!formData.policeDeclaration || !formData.policeDeclaration.trim()) newErrors.policeDeclaration = "Declaration is required.";
            break;
          case "administrative":
            if (!formData.projectName || !formData.projectName.trim()) newErrors.projectName = "Project Name is required.";
            if (!formData.projectLocation || !formData.projectLocation.trim()) newErrors.projectLocation = "Project Location is required.";
            if (!formData.projectProblem || !formData.projectProblem.trim()) newErrors.projectProblem = "Problem Description is required.";
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
      toast.error(`Please correct the errors on Step ${firstFailedStep} before submitting.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/addform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Visitor registered successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error submitting the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Personal Info", "Address", "Purpose", "Review"];

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  const renderInput = (label, name, type = "text", placeholder = "") => {
    const hasError = !!errors[name];
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
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
          <option value="">Select {label.toLowerCase()}</option>
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
            <div className="relative group max-w-sm mx-auto">
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
              className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/20 transition-all duration-300 ${
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

  const renderPurposeFields = () => {
    switch (formData.purpose) {
      case "medical":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Patient Name", "patiantName")}
            {renderInput("Hospital Name", "hospitalName")}
            {renderInput("Tracking Doctor", "trackingDoctor")}
            {renderInput("Reason", "reason")}
          </div>
        );
      case "education":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Student Name", "studentName")}
              {renderInput("Student DOB", "studentDOB", "date")}
              {renderSelect("Student Gender", "studentGender", [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ])}
              {renderInput("Category", "studentCategory")}
            </div>
            {renderFileUpload("Student Photo", "studentPhoto")}
          </div>
        );
      case "job":
        return (
          <div className="space-y-4 mt-4">
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1">Job Application</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Full Name", "jobFullName")}
              {renderInput("Position Applied For", "jobPosition")}
              {renderInput("Department", "jobDepartment")}
              {renderInput("Preferred Location", "jobLocation")}
              {renderInput("Expected Salary", "jobSalary")}
            </div>
            <h4 className="text-slate-800 font-bold text-sm border-b border-orange-100 pb-1 pt-2">Employee Transfer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Employee Name", "employeeName")}
              {renderInput("Employee ID", "employeeId")}
              {renderInput("Department", "employeeDepartment")}
              {renderInput("Designation", "employeeDesignation")}
              {renderInput("Requested Department", "employeeRDepartment")}
              {renderInput("Requested Transfer", "employeeRTransfer")}
            </div>
          </div>
        );
      case "schemes":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Scheme Name", "schemeName")}
            {renderInput("Previous Application", "schemePApplication")}
            {renderInput("Apply Date", "schemeApplyDate", "date")}
            {renderSelect("Marital Status", "schemeMaritalStatus", [
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "divorced", label: "Divorced" },
              { value: "widowed", label: "Widowed" },
            ])}
            {renderInput("Category", "schemeCategary")}
            {renderInput("Aadhar Number", "schemeAddhar")}
          </div>
        );
      case "business":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Business Name", "businessName")}
            {renderInput("Business Type", "businessType")}
            {renderInput("Business Sector", "businessSector")}
            {renderInput("Registration No.", "businessRNo")}
            {renderInput("Date of Establishment", "businessDOE", "date")}
            {renderInput("GST Number", "businessGST")}
            <div className="md:col-span-2">
              {renderInput("Business Address", "businessAddress")}
            </div>
          </div>
        );
      case "utility":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Service Installation", "utilityServiceInstallation")}
            {renderInput("Problem Description", "utilityProblem")}
          </div>
        );
      case "police":
        return (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Application No.", "policeApplicationNo")}
              {renderInput("Application Date", "policeApplicationDate", "date")}
              {renderInput("Application Place", "policeApplicationPlace")}
              {renderInput("Involved Person Name", "policeInvolveName")}
            </div>
            <div>
              <label className={labelClass}>Incident Details</label>
              <textarea
                name="policeIncidentDetails"
                value={formData.policeIncidentDetails}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none ${
                  errors.policeIncidentDetails
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
                placeholder="Describe the incident..."
              />
              {errors.policeIncidentDetails && (
                <p className="text-xs text-red-500 mt-1">{errors.policeIncidentDetails}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Declaration</label>
              <textarea
                name="policeDeclaration"
                value={formData.policeDeclaration}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none ${
                  errors.policeDeclaration
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
                placeholder="Your declaration..."
              />
              {errors.policeDeclaration && (
                <p className="text-xs text-red-500 mt-1">{errors.policeDeclaration}</p>
              )}
            </div>
            {renderFileUpload("Photo Evidence", "policePhoto")}
          </div>
        );
      case "administrative":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {renderInput("Project Name", "projectName")}
            {renderInput("Project Location", "projectLocation")}
            <div className="md:col-span-2">
              <label className={labelClass}>Problem Description</label>
              <textarea
                name="projectProblem"
                value={formData.projectProblem}
                onChange={handleChange}
                rows={3}
                className={`${inputClass} resize-none ${
                  errors.projectProblem
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
                placeholder="Describe the problem..."
              />
              {errors.projectProblem && (
                <p className="text-xs text-red-500 mt-1">{errors.projectProblem}</p>
              )}
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
                    Quickly pre-fill your details using your registered phone number.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Enter registered phone number..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={handleRevisitLookup}
                  disabled={isSearching || !searchPhone}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5 whitespace-nowrap"
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
                    "Look Up Details"
                  )}
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
            {renderFileUpload("Photo", "photos")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("Full Name", "fullName")}
              {renderInput("Email", "email", "email")}
              {renderInput("Phone Number", "phoneNo", "tel")}
              {renderInput("Age", "age", "number")}
              {renderSelect("Gender", "sex", [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ])}
              {renderInput("Date of Birth", "DOB", "date")}
              {renderInput("Aadhar / Voter ID", "aadharVoter")}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("House No.", "houseNo")}
              {renderInput("Landmark", "landmark")}
              {renderInput("Village / Town", "village")}
              {renderInput("State", "state")}
              {renderInput("Nation", "nation")}
              {renderInput("Pincode", "pincode")}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Purpose of Visit</h3>
            {renderSelect("Purpose", "purpose", [
              { value: "medical", label: "Medical" },
              { value: "education", label: "Education" },
              { value: "job", label: "Job" },
              { value: "schemes", label: "Schemes" },
              { value: "business", label: "Business" },
              { value: "utility", label: "Utility" },
              { value: "police", label: "Police Station" },
              { value: "administrative", label: "Administrative" },
            ])}
            {renderPurposeFields()}
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-slate-800">Review & Submit</h3>
            {isSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl text-green-600 flex-shrink-0">
                  <HiCheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-green-800 font-bold text-base">Visitor Registered Successfully!</h4>
                  <p className="text-xs text-green-600 mt-1 leading-relaxed">
                    The registration has been processed successfully. You can review the details below.
                  </p>
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Additional Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitted}
                rows={4}
                className={`${inputClass} resize-none ${isSubmitted ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100" : ""}`}
                placeholder="Any additional message or notes..."
              />
            </div>
            <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 space-y-3">
              <h4 className="text-slate-800 font-bold text-sm mb-3">Summary</h4>
              {formData.photos && (
                <div className="flex justify-center mb-4">
                  <img src={formData.photos} alt="Visitor" className="w-20 h-20 rounded-full object-cover border-2 border-orange-500" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Name", formData.fullName],
                  ["Email", formData.email],
                  ["Phone", formData.phoneNo],
                  ["Age", formData.age],
                  ["Gender", formData.sex],
                  ["DOB", formData.DOB],
                  ["Aadhar/Voter", formData.aadharVoter],
                  ["House No.", formData.houseNo],
                  ["Landmark", formData.landmark],
                  ["Village", formData.village],
                  ["State", formData.state],
                  ["Nation", formData.nation],
                  ["Pincode", formData.pincode],
                  ["Purpose", formData.purpose],
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
                  <span className="text-slate-500 text-sm">Message: </span>
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Visitor Registration
            </h1>
            <p className="text-slate-500 mt-2">Complete all steps to register a new visitor</p>
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
                        houseNo: "", landmark: "", village: "", state: "", nation: "", pincode: "",
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
                      Previous
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
    </>
  );
};

export default Form;
