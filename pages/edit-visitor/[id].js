import React, { useState, useEffect } from "react";
import mongoose from "mongoose";
import FormModel from "@/models/form";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiSave, HiArrowLeft } from "react-icons/hi";

const EditVisitor = ({ visitor }) => {
  const [formData, setFormData] = useState({
    ...visitor,
    address: visitor.address || [
      visitor.houseNo,
      visitor.landmark,
      visitor.village,
      visitor.pincode ? String(visitor.pincode) : ""
    ].filter((val) => val && val.trim() !== "").join(", ")
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "purpose") {
        updated.subPurpose = "";
        updated.customPurpose = "";
      } else if (name === "subPurpose") {
        updated.customPurpose = "";
      }
      return updated;
    });
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
        setTimeout(() => router.push("/admin/visitorTable"), 1500);
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

  return (
    <>
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
                {renderInput("Phone Number", "phoneNo", "tel")}
                {renderSelect("Gender", "sex", [
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ])}
                {renderSelect("Nature of Work", "purpose", [
                  { value: "MEET WITH DADA", label: "MEET WITH DADA" },
                  { value: "ROAD", label: "ROAD" },
                  { value: "FOOTPATH", label: "FOOTPATH" },
                  { value: "DRAINAGE", label: "DRAINAGE" },
                  { value: "WATER", label: "WATER" },
                  { value: "STORM WATER CRISIS", label: "STORM WATER CRISIS" },
                  { value: "WASTE MANAGEMENT", label: "WASTE MANAGEMENT" },
                  { value: "FOLLIAGE MANAGEMENT", label: "FOLLIAGE MANAGEMENT" },
                  { value: "DEBRIS MANAGEMENT", label: "DEBRIS MANAGEMENT" },
                  { value: "TREE CUTTING", label: "TREE CUTTING" },
                  { value: "STREET LIGHTS", label: "STREET LIGHTS" },
                  { value: "DEATH INTIMATION LETTER", label: "DEATH INTIMATION LETTER" },
                  { value: "JOB REFERENCE LETTER", label: "JOB REFERENCE LETTER" },
                  { value: "MSEB", label: "MSEB" },
                  { value: "BIRTH & DEATH CERTIFICATE CORRECTION", label: "BIRTH & DEATH CERTIFICATE CORRECTION" },
                  { value: "RECOMONDATION LETTER", label: "RECOMONDATION LETTER" },
                  { value: "ADMISSION LETTER", label: "ADMISSION LETTER" },
                  { value: "toilet", label: "toilet" },
                  { value: "medical assit.", label: "medical assit." },
                  { value: "ambulance", label: "ambulance" },
                  { value: "ration kit", label: "ration kit" },
                  { value: "Monitery Help", label: "Monitery Help" },
                  { value: "chairty", label: "chairty" },
                  { value: "in kind help", label: "in kind help" },
                  { value: "tanker", label: "tanker" },
                  { value: "SCHOOL / COLLEGE FEE LETTER", label: "SCHOOL / COLLEGE FEE LETTER" },
                  { value: "Other", label: "Other" }
                ])}
              </div>

              {formData.purpose && (
                <div className="mt-4">
                  {renderInput(
                    `Nature of Work Details ${formData.purpose === "Other" ? "(Required)" : "(Optional)"}`,
                    "customPurpose"
                  )}
                </div>
              )}

              {formData.purpose === "DRAINAGE" && (
                <div className="mt-4">
                  {renderSelect("Drainage Sub-Type", "subPurpose", [
                    { value: "ROUND CHAMBER", label: "ROUND CHAMBER" },
                    { value: "RECTANGLE CHAMBER", label: "RECTANGLE CHAMBER" },
                    { value: "LINE CHANGE", label: "LINE CHANGE" },
                    { value: "REPAIR WORK", label: "REPAIR WORK" },
                    { value: "JETTING REQUIRED", label: "JETTING REQUIRED" },
                    { value: "Other", label: "Other" }
                  ])}
                </div>
              )}

              {formData.purpose === "DRAINAGE" && formData.subPurpose && (
                <div className="mt-4">
                  {renderInput(
                    `Drainage Details ${formData.subPurpose === "Other" ? "(Required)" : "(Optional)"}`,
                    "customSubPurpose"
                  )}
                </div>
              )}

              <div className="mt-4">
                <label className={labelClass}>Address</label>
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Enter complete address details"
                />
              </div>
            </div>

            <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-orange-100 pb-1">Follow-up & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect("Status", "status", [
                  { value: "Pending", label: "Pending" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Completed", label: "Completed" },
                  { value: "Rejected", label: "Rejected" },
                ])}
              </div>
              <div>
                <label className={labelClass}>Follow-up Details</label>
                <textarea
                  name="followUp"
                  value={formData.followUp || ""}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass + " resize-none"}
                  placeholder="Enter current progress or follow-up details..."
                />
              </div>
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
