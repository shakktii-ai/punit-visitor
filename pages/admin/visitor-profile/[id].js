import React, { useState, useEffect } from "react";
import Head from "next/head";
import mongoose from "mongoose";
import FormModel from "@/models/form";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  HiArrowLeft,
  HiPencil,
  HiPrinter,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCalendar,
  HiIdentification,
  HiClock,
  HiUser,
  HiDocumentText,
  HiRefresh,
} from "react-icons/hi";

export default function VisitorProfile({ visitor, initialVisits }) {
  const router = useRouter();
  const [visits, setVisits] = useState(initialVisits || []);
  const [loading, setLoading] = useState(false);

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

  const fetchLatestHistory = async () => {
    if (!visitor?.phoneNo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/visitor-history?phone=${encodeURIComponent(visitor.phoneNo)}`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits || []);
        toast.success("Visit history updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh history");
    } finally {
      setLoading(false);
    }
  };

  if (!visitor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Visitor Not Found</h2>
          <button
            onClick={() => router.push("/admin/visitorTable")}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium"
          >
            Back to Visitors
          </button>
        </div>
      </div>
    );
  }

  const combinedAddress = visitor.address || [
    visitor.houseNo,
    visitor.landmark,
    visitor.village,
    visitor.pincode ? String(visitor.pincode) : ""
  ].filter((val) => val && val.trim() !== "").join(", ");

  const latestVisit = visits[0] || visitor;
  const currentStatus = latestVisit.status || visitor.status || "Pending";

  const getStatusBadge = (status) => {
    let color = "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "In Progress") color = "bg-blue-100 text-blue-700 border-blue-200";
    if (status === "Completed") color = "bg-green-100 text-green-700 border-green-200";
    if (status === "Rejected") color = "bg-red-100 text-red-700 border-red-200";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${color}`}>
        {status}
      </span>
    );
  };

  const getPurposeSpecificFields = (v) => {
    const fields = [
      ["Patient Name", v.patiantName],
      ["Hospital", v.hospitalName],
      ["Tracking Doctor", v.trackingDoctor],
      ["Medical Reason", v.reason],
      ["Student Name", v.studentName],
      ["Student DOB", v.studentDOB ? new Date(v.studentDOB).toLocaleDateString("en-IN") : null],
      ["Student Gender", v.studentGender],
      ["Student Category", v.studentCategory],
      ["Job Full Name", v.jobFullName],
      ["Position Applied", v.jobPosition],
      ["Job Department", v.jobDepartment],
      ["Preferred Location", v.jobLocation],
      ["Expected Salary", v.jobSalary ? `₹${v.jobSalary}` : null],
      ["Employee Name", v.employeeName],
      ["Employee ID", v.employeeId],
      ["Emp. Department", v.employeeDepartment],
      ["Designation", v.employeeDesignation],
      ["Req. Department", v.employeeRDepartment],
      ["Req. Transfer", v.employeeRTransfer],
      ["Scheme Name", v.schemeName],
      ["Prev. Application", v.schemePApplication],
      ["Apply Date", v.schemeApplyDate ? new Date(v.schemeApplyDate).toLocaleDateString("en-IN") : null],
      ["Marital Status", v.schemeMaritalStatus],
      ["Scheme Category", v.schemeCategary],
      ["Scheme Aadhar", v.schemeAddhar],
      ["Business Name", v.businessName],
      ["Business Type", v.businessType],
      ["Business Sector", v.businessSector],
      ["Registration No.", v.businessRNo],
      ["Date of Est.", v.businessDOE ? new Date(v.businessDOE).toLocaleDateString("en-IN") : null],
      ["GST No.", v.businessGST],
      ["Business Address", v.businessAddress],
      ["Utility Service", v.utilityServiceInstallation],
      ["Utility Problem", v.utilityProblem],
      ["Police App. No.", v.policeApplicationNo],
      ["Police App. Date", v.policeApplicationDate ? new Date(v.policeApplicationDate).toLocaleDateString("en-IN") : null],
      ["App. Place", v.policeApplicationPlace],
      ["Incident Details", v.policeIncidentDetails],
      ["Involved Person", v.policeInvolveName],
      ["Declaration", v.policeDeclaration],
      ["Project Name", v.projectName],
      ["Project Location", v.projectLocation],
      ["Project Problem", v.projectProblem],
      ["Message / Description", v.message],
    ].filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== "");

    return fields;
  };

  return (
    <>
      <Head>
        <title>{visitor.fullName} – Visitor Profile</title>
        <meta name="description" content={`Visitor profile and visit history for ${visitor.fullName}`} />
      </Head>

      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Top Header / Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/visitorTable")}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back to Visitors Table"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{visitor.fullName}</h1>
                {getStatusBadge(currentStatus)}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">Visitor Profile & Visit Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLatestHistory}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-orange-200 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              <HiRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push(`/edit-visitor/${visitor._id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20"
            >
              <HiPencil className="w-4 h-4" />
              Edit Visitor
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <HiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6 md:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/5 to-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Avatar / Photo */}
            <div className="flex-shrink-0">
              {visitor.photos ? (
                <img
                  src={visitor.photos}
                  alt={visitor.fullName}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-orange-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-3xl shadow-md border-4 border-orange-100">
                  {visitor.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{visitor.fullName}</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  First Registered: {visitor.createdAt ? new Date(visitor.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                  <HiPhone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="font-semibold">{visitor.phoneNo || "—"}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                  <HiUser className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="capitalize">{visitor.sex ? (visitor.sex === "male" ? "Male" : visitor.sex === "female" ? "Female" : visitor.sex) : "—"}</span>
                  {visitor.age ? <span className="text-slate-400 text-xs">({visitor.age} yrs)</span> : null}
                </div>

                {visitor.email && (
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 truncate">
                    <HiMail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{visitor.email}</span>
                  </div>
                )}

                {visitor.aadharVoter && (
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                    <HiIdentification className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span>ID: {visitor.aadharVoter}</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100 sm:col-span-2">
                  <HiLocationMarker className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{combinedAddress || "Address not specified"}</span>
                </div>
              </div>
            </div>

            {/* Total Visits Stat Badge */}
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/60 p-4 rounded-2xl text-center min-w-[130px] self-stretch md:self-auto flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-orange-600">{visits.length}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">
                Total Visit{visits.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Visit History & Tracking Timeline */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-orange-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <HiClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Visit History & Tracking Log</h3>
                <p className="text-slate-400 text-xs">Chronological timeline of all recorded visits and follow-ups</p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
              {visits.length} Record{visits.length !== 1 ? "s" : ""}
            </span>
          </div>

          {visits.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <HiDocumentText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No visit history records found.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-orange-200/80 space-y-8 ml-3 py-2">
              {visits.map((v, index) => {
                const dateObj = v.createdAt ? new Date(v.createdAt) : null;
                const dateStr = dateObj
                  ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "—";
                const timeStr = dateObj
                  ? dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
                  : "";

                const purposeExtra = v.purpose === "DRAINAGE" && v.subPurpose ? ` (${v.subPurpose})` : "";
                const specificFields = getPurposeSpecificFields(v);

                return (
                  <div key={v._id || index} className="relative group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[33px] top-4 w-4 h-4 rounded-full border-4 border-white bg-orange-500 shadow-sm group-hover:scale-125 transition-transform" />

                    <div className="bg-slate-50/70 border border-slate-200/80 hover:border-orange-200 hover:shadow-md transition-all p-5 md:p-6 rounded-2xl space-y-4">
                      {/* Visit Header: Index, Date, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-600 bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-md">
                            Visit #{visits.length - index}
                          </span>
                          <span className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                            <HiCalendar className="w-4 h-4 text-slate-400" />
                            {dateStr}
                            <span className="text-slate-400 font-normal text-xs">{timeStr}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {v.visitMode && (
                            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              📍 {v.visitMode}
                            </span>
                          )}
                          {getStatusBadge(v.status || "Pending")}
                        </div>
                      </div>

                      {/* Purpose & Nature of Work */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nature of Work / Purpose</p>
                        <p className="text-slate-800 font-bold text-base">
                          {v.purpose || "Not Specified"}
                          <span className="text-orange-600 font-semibold text-sm">{purposeExtra}</span>
                        </p>
                        {(v.customPurpose || v.customSubPurpose) && (
                          <p className="text-sm text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 mt-1">
                            Details: {v.customPurpose || v.customSubPurpose}
                          </p>
                        )}
                      </div>

                      {/* Purpose-Specific Details Grid if any */}
                      {specificFields.length > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-slate-200/60 space-y-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Details</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {specificFields.map(([label, val]) => (
                              <div key={label} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">{label}</span>
                                <span className="text-slate-800 font-semibold break-words">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tracking / Follow-Up Box */}
                      {v.followUp ? (
                        <div className="bg-orange-50 border border-orange-200/80 p-4 rounded-xl space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                              Tracking & Follow-up Log
                            </h4>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed break-words pt-1">
                            {v.followUp}
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">No follow-up notes recorded for this visit.</div>
                      )}

                      {/* Metadata Footer */}
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                        <span>Registered By: <strong className="text-slate-600">{v.addedBy || "Admin"}</strong></span>
                        {v.updatedAt && (
                          <span>Last Updated: {new Date(v.updatedAt).toLocaleDateString("en-IN")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const visitor = await FormModel.findById(id);

    if (!visitor) {
      return { notFound: true };
    }

    let visits = [];
    if (visitor.phoneNo) {
      visits = await FormModel.find({ phoneNo: visitor.phoneNo }).sort({ createdAt: -1 });
    } else {
      visits = [visitor];
    }

    return {
      props: {
        visitor: JSON.parse(JSON.stringify(visitor)),
        initialVisits: JSON.parse(JSON.stringify(visits)),
      },
    };
  } catch (error) {
    console.error("Error loading visitor profile:", error);
    return { notFound: true };
  }
}
