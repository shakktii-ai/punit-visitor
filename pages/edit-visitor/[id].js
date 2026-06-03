import React, { useState } from "react";
import mongoose from "mongoose";
import FormModel from "@/models/form";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiSave, HiArrowLeft } from "react-icons/hi";

const EditVisitor = ({ visitor }) => {
  const [formData, setFormData] = useState(visitor);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/update-visitor/${visitor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Visitor updated successfully!");
        setTimeout(() => router.push("/admin/visitorList"), 1500);
      } else {
        toast.error("Failed to update the visitor.");
      }
    } catch (error) {
      console.error("Error updating visitor:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300";

  const labelClass = "block text-slate-700 text-sm font-medium mb-1.5";

  const renderInput = (label, name, type = "text", readOnly = false) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        readOnly={readOnly}
        className={`${inputClass} ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );

  const renderSelect = (label, name, options, readOnly = false) => (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        disabled={readOnly}
        className={`${inputClass} ${readOnly ? "opacity-60 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderPurposeFields = () => {
    const purpose = formData.purpose;
    switch (purpose) {
      case "medical":
        return (
          <>
            {renderInput("Patient Name", "patiantName")}
            {renderInput("Hospital Name", "hospitalName")}
            {renderInput("Tracking Doctor", "trackingDoctor")}
            {renderInput("Reason", "reason")}
          </>
        );
      case "education":
        return (
          <>
            {renderInput("Student Name", "studentName")}
            {renderInput("Student DOB", "studentDOB", "date")}
            {renderInput("Student Gender", "studentGender")}
            {renderInput("Category", "studentCategory")}
          </>
        );
      case "job":
        return (
          <>
            {renderInput("Full Name", "jobFullName")}
            {renderInput("Position", "jobPosition")}
            {renderInput("Department", "jobDepartment")}
            {renderInput("Location", "jobLocation")}
            {renderInput("Expected Salary", "jobSalary")}
            {renderInput("Employee Name", "employeeName")}
            {renderInput("Employee ID", "employeeId")}
            {renderInput("Employee Department", "employeeDepartment")}
            {renderInput("Designation", "employeeDesignation")}
            {renderInput("Requested Department", "employeeRDepartment")}
            {renderInput("Requested Transfer", "employeeRTransfer")}
          </>
        );
      case "schemes":
        return (
          <>
            {renderInput("Scheme Name", "schemeName")}
            {renderInput("Previous Application", "schemePApplication")}
            {renderInput("Apply Date", "schemeApplyDate", "date")}
            {renderInput("Marital Status", "schemeMaritalStatus")}
            {renderInput("Category", "schemeCategary")}
            {renderInput("Aadhar", "schemeAddhar")}
          </>
        );
      case "business":
        return (
          <>
            {renderInput("Business Name", "businessName")}
            {renderInput("Business Type", "businessType")}
            {renderInput("Business Sector", "businessSector")}
            {renderInput("Registration No.", "businessRNo")}
            {renderInput("Date of Establishment", "businessDOE", "date")}
            {renderInput("GST Number", "businessGST")}
            {renderInput("Business Address", "businessAddress")}
          </>
        );
      case "utility":
        return (
          <>
            {renderInput("Service Installation", "utilityServiceInstallation")}
            {renderInput("Problem", "utilityProblem")}
          </>
        );
      case "police":
        return (
          <>
            {renderInput("Application No.", "policeApplicationNo")}
            {renderInput("Application Date", "policeApplicationDate", "date")}
            {renderInput("Application Place", "policeApplicationPlace")}
            {renderInput("Incident Details", "policeIncidentDetails")}
            {renderInput("Involved Person", "policeInvolveName")}
            {renderInput("Declaration", "policeDeclaration")}
          </>
        );
      case "administrative":
        return (
          <>
            {renderInput("Project Name", "projectName")}
            {renderInput("Project Location", "projectLocation")}
            {renderInput("Problem", "projectProblem")}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-slate-50 to-orange-100/20 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Edit Visitor
              </h1>
              <p className="text-slate-500 text-sm mt-1">Update visitor information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-orange-100 pb-1">Personal Information</h3>
              {formData.photos && (
                <div className="flex justify-center">
                  <img
                    src={formData.photos}
                    alt="Visitor"
                    className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
                  />
                </div>
              )}
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

            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-orange-100 pb-1">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput("House No.", "houseNo")}
                {renderInput("Landmark", "landmark")}
                {renderInput("Village / Town", "village")}
                {renderInput("State", "state")}
                {renderInput("Nation", "nation")}
                {renderInput("Pincode", "pincode")}
              </div>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-orange-100 pb-1">Purpose Details</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderPurposeFields()}
              </div>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-orange-100 pb-1">Message</h3>
              <textarea
                name="message"
                value={formData.message || ""}
                onChange={handleChange}
                rows={4}
                className={inputClass + " resize-none"}
                placeholder="Any additional message or notes..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps({ params }) {
  const { id } = params;

  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const visitor = await FormModel.findById(id);

  if (!visitor) {
    return { notFound: true };
  }

  return {
    props: { visitor: JSON.parse(JSON.stringify(visitor)) },
  };
}

export default EditVisitor;
