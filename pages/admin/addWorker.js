import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HiUser, HiCloudUpload, HiDownload, HiCheckCircle, HiXCircle, HiRefresh, HiUserAdd, HiArrowLeft, HiDatabase } from "react-icons/hi";
import WorkerForm from "@/components/WorkerForm";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";

export default function AddWorker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("single"); // "single" or "bulk"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Bulk Import State
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [validWorkers, setValidWorkers] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  // Handle submit for Single Registration
  const handleSubmitSingle = async (formData) => {
    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const payload = {
        ...formData,
        createdBy: "admin",
        addedBy: username,
      };

      const res = await fetch("/api/workers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Party Worker registered successfully!");
        setTimeout(() => {
          router.push("/admin/workers");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to submit registration.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: clean mobile numbers to 10 digits
  const cleanPhone = (val) => {
    if (!val) return "";
    return val.toString().trim().replace(/[^0-9]/g, "");
  };

  // Helper: clean pincodes
  const cleanPincode = (val) => {
    if (!val) return "";
    return val.toString().trim().replace(/[^0-9]/g, "");
  };

  // Helper: parse date to YYYY-MM-DD format
  const formatExcelDate = (val) => {
    if (!val) return "";
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof val === 'string') {
      const clean = val.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
      const parts = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (parts) {
        const day = parts[1].padStart(2, '0');
        const month = parts[2].padStart(2, '0');
        const year = parts[3];
        return `${year}-${month}-${day}`;
      }
      return clean;
    }
    if (typeof val === 'number') {
      try {
        const date = new Date((val - 25569) * 86400 * 1000);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      } catch {
        return "";
      }
    }
    return "";
  };

  // Helper: translate positions to database format
  const translatePosition = (posStr) => {
    if (!posStr) return "";
    const clean = posStr.toString().trim().toLowerCase();
    const positionTranslation = {
      "booth head": "Booth Head",
      "shakti kendra head": "Shakti Kendra Head",
      "mandal president": "Mandal President",
      "mandal general secretary": "Mandal General Secretary",
      "city vice president": "City Vice President",
      "district executive member": "District Executive Member",
      "worker": "Worker",
      "party worker": "Worker",
      "बूथ प्रमुख": "Booth Head",
      "शक्ती केंद्र प्रमुख": "Shakti Kendra Head",
      "मंडळ अध्यक्ष": "Mandal President",
      "मंडळ सरचिटणीस": "Mandal General Secretary",
      "शहर उपाध्यक्ष": "City Vice President",
      "जिल्हा कार्यकारिणी सदस्य": "District Executive Member",
      "कार्यकर्ता": "Worker"
    };
    return positionTranslation[clean] || "";
  };

  // Helper: normalize header keys from various synonyms
  const normalizeHeaders = (row) => {
    const normalized = {};
    const keyMap = {
      "first name": "firstName",
      "middle name": "middleName",
      "last name": "lastName",
      "lastname": "lastName",
      "primary mobile": "primaryPhone",
      "mobile": "primaryPhone",
      "phone": "primaryPhone",
      "mobile number": "primaryPhone",
      "contact number": "primaryPhone",
      "primary phone": "primaryPhone",
      "alternative mobile": "alternativePhone",
      "alt mobile": "alternativePhone",
      "alternative phone": "alternativePhone",
      "alt phone": "alternativePhone",
      "position": "position",
      "designation": "position",
      "role": "position",
      "area name / booth": "areaNameOrBooth",
      "area name": "areaNameOrBooth",
      "booth": "areaNameOrBooth",
      "booth no": "areaNameOrBooth",
      "house no": "houseNo",
      "house number": "houseNo",
      "home no": "houseNo",
      "street / road": "street",
      "street": "street",
      "road": "street",
      "village / city": "village",
      "village": "village",
      "city": "village",
      "taluka": "taluka",
      "tehsil": "taluka",
      "district": "district",
      "pincode": "pincode",
      "pin code": "pincode",
      "zip": "pincode",
      "zipcode": "pincode",
      "date of birth": "DOB",
      "dob": "DOB",
      "birth date": "DOB",
      "marital status": "maritalStatus",
      "maritalstatus": "maritalStatus",
      "spouse name": "spouseName",
      "spousename": "spouseName",
      "spouse dob": "spouseDOB",
      "spousedob": "spouseDOB",
      "anniversary date": "anniversaryDate",
      "anniversarydate": "anniversaryDate",
      "marriage anniversary": "anniversaryDate",
      "father name": "fatherName",
      "fathername": "fatherName",
      "father dob": "fatherDOB",
      "fatherdob": "fatherDOB",
      "mother name": "motherName",
      "mothername": "motherName",
      "mother dob": "motherDOB",
      "motherdob": "motherDOB",
      "parents anniversary date": "parentsAnniversaryDate",
      "parentsanniversarydate": "parentsAnniversaryDate"
    };

    Object.keys(row).forEach((key) => {
      const lowerKey = key.trim().toLowerCase();
      const mappedKey = keyMap[lowerKey];
      if (mappedKey) {
        normalized[mappedKey] = row[key];
      }
    });

    return normalized;
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      "First Name", "Middle Name", "LastName", "Primary Mobile", "Alternative Mobile",
      "Position", "Area Name / Booth", "House No", "Street / Road", "Village / City",
      "Taluka", "District", "Pincode", "Date of Birth", "Marital Status",
      "Spouse Name", "Spouse DOB", "Anniversary Date", "Father Name", "Father DOB",
      "Mother Name", "Mother DOB", "Parents Anniversary Date"
    ];
    
    // Sample rows in English & Marathi guidance to help user format spreadsheet
    const sampleData = [
      {
        "First Name": "Amit",
        "Middle Name": "Rajesh",
        "LastName": "Sharma",
        "Primary Mobile": "9876543210",
        "Alternative Mobile": "9123456789",
        "Position": "Worker",
        "Area Name / Booth": "Booth No. 145",
        "House No": "45A",
        "Street / Road": "Main MG Road",
        "Village / City": "Kothrud",
        "Taluka": "Pune",
        "District": "Pune",
        "Pincode": "411038",
        "Date of Birth": "1988-06-15",
        "Marital Status": "Married",
        "Spouse Name": "Sunita Sharma",
        "Spouse DOB": "1991-03-24",
        "Anniversary Date": "2013-11-21",
        "Father Name": "Rajesh Sharma",
        "Father DOB": "1958-02-10",
        "Mother Name": "Pushpa Sharma",
        "Mother DOB": "1962-09-12",
        "Parents Anniversary Date": "1982-05-18"
      },
      {
        "First Name": "Vijay",
        "Middle Name": "Shankar",
        "LastName": "Patil",
        "Primary Mobile": "9988776655",
        "Alternative Mobile": "",
        "Position": "Booth Head",
        "Area Name / Booth": "Booth No. 12",
        "House No": "12",
        "Street / Road": "Grampanchayat Lane",
        "Village / City": "Warje",
        "Taluka": "Pune",
        "District": "Pune",
        "Pincode": "411058",
        "Date of Birth": "1994-09-02",
        "Marital Status": "Single",
        "Spouse Name": "",
        "Spouse DOB": "",
        "Anniversary Date": "",
        "Father Name": "Shankar Patil",
        "Father DOB": "1964-10-25",
        "Mother Name": "Komal Patil",
        "Mother DOB": "1968-12-01",
        "Parents Anniversary Date": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Write workbook file
    XLSX.writeFile(wb, "Party_Workers_Template.xlsx");
    toast.success("Excel template downloaded!");
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndParseFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndParseFile(file);
    }
  };

  // Parse and validate Excel file client-side
  const validateAndParseFile = (file) => {
    const validExtensions = ["xlsx", "xls", "csv"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setBulkFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true, dateNF: 'yyyy-mm-dd' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawRows.length === 0) {
          toast.error("Spreadsheet does not contain any data.");
          setParsedRows([]);
          setIsParsing(false);
          return;
        }

        const validList = [];
        const invalidList = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // Row number in Excel sheet (header is row 1)
          const norm = normalizeHeaders(row);

          const firstName = norm.firstName ? norm.firstName.toString().trim() : "";
          const lastName = norm.lastName ? norm.lastName.toString().trim() : "";
          const primaryPhone = cleanPhone(norm.primaryPhone);
          const rawPosition = norm.position ? norm.position.toString().trim() : "";
          const position = translatePosition(rawPosition);
          const alternativePhone = cleanPhone(norm.alternativePhone);
          const pincode = cleanPincode(norm.pincode);

          const rowErrors = [];

          // Core Validations
          if (!firstName) {
            rowErrors.push("First Name is missing.");
          }
          if (!lastName) {
            rowErrors.push("Last Name is missing.");
          }
          if (!primaryPhone) {
            rowErrors.push("Primary Mobile is missing.");
          } else if (primaryPhone.length !== 10) {
            rowErrors.push(`Primary Mobile (${primaryPhone}) must be exactly 10 digits.`);
          }
          if (alternativePhone && alternativePhone.length !== 10) {
            rowErrors.push(`Alternative Mobile (${alternativePhone}) must be exactly 10 digits.`);
          }
          if (!rawPosition) {
            rowErrors.push("Position is missing.");
          } else if (!position) {
            rowErrors.push(`Invalid position '${rawPosition}'. Must be one of: Booth Head, Shakti Kendra Head, Mandal President, Mandal General Secretary, City Vice President, District Executive Member, Worker.`);
          }
          if (pincode && pincode.length !== 6) {
            rowErrors.push(`Pincode (${pincode}) must be exactly 6 digits.`);
          }

          const parsedWorker = {
            firstName,
            middleName: norm.middleName ? norm.middleName.toString().trim() : "",
            lastName,
            houseNo: norm.houseNo ? norm.houseNo.toString().trim() : "",
            street: norm.street ? norm.street.toString().trim() : "",
            village: norm.village ? norm.village.toString().trim() : "",
            taluka: norm.taluka ? norm.taluka.toString().trim() : "",
            district: norm.district ? norm.district.toString().trim() : "",
            pincode: pincode ? parseInt(pincode, 10) : "",
            primaryPhone,
            alternativePhone,
            position: position || rawPosition, // store translated position
            areaNameOrBooth: norm.areaNameOrBooth ? norm.areaNameOrBooth.toString().trim() : "",
            DOB: formatExcelDate(norm.DOB),
            maritalStatus: norm.maritalStatus ? norm.maritalStatus.toString().trim() : "",
            spouseName: norm.spouseName ? norm.spouseName.toString().trim() : "",
            spouseDOB: formatExcelDate(norm.spouseDOB),
            anniversaryDate: formatExcelDate(norm.anniversaryDate),
            fatherName: norm.fatherName ? norm.fatherName.toString().trim() : "",
            fatherDOB: formatExcelDate(norm.fatherDOB),
            motherName: norm.motherName ? norm.motherName.toString().trim() : "",
            motherDOB: formatExcelDate(norm.motherDOB),
            parentsAnniversaryDate: formatExcelDate(norm.parentsAnniversaryDate),
          };

          if (rowErrors.length > 0) {
            invalidList.push({
              rowNum,
              worker: parsedWorker,
              errors: rowErrors,
            });
          } else {
            validList.push(parsedWorker);
          }
        });

        setParsedRows(rawRows);
        setValidWorkers(validList);
        setInvalidRows(invalidList);
        toast.info(`Parsed ${rawRows.length} rows. Valid: ${validList.length}, Invalid: ${invalidList.length}`);
      } catch (err) {
        console.error(err);
        toast.error("Error reading file content.");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit Bulk Import to server
  const handleBulkSubmit = async () => {
    if (validWorkers.length === 0) {
      toast.warn("No valid worker records to import.");
      return;
    }

    setIsSubmitting(true);
    try {
      const username = localStorage.getItem("username") || "admin";
      const res = await fetch("/api/workers/bulk-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
          "x-username": username,
        },
        body: JSON.stringify({ workers: validWorkers }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `Successfully imported ${data.count} workers!`);
        setTimeout(() => {
          router.push("/admin/workers");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to bulk register workers.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during bulk registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBulk = () => {
    setBulkFile(null);
    setParsedRows([]);
    setValidWorkers([]);
    setInvalidRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Head>
        <title>Add Party Worker – Admin Panel</title>
        <meta name="description" content="Add party worker manually or import in bulk using Excel templates." />
      </Head>

      <div className="min-h-screen bg-slate-50/50 py-6">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Main Tab Controls */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-2 mb-6 flex gap-2">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "single"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <HiUserAdd className="w-5 h-5" />
              Single Registration
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "bulk"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <HiDatabase className="w-5 h-5" />
              Bulk Excel Import
            </button>
          </div>

          {/* TAB 1: Single Registration */}
          {activeTab === "single" && (
            <WorkerForm
              onSubmit={handleSubmitSingle}
              isSubmitting={isSubmitting}
              backPath="/admin/workers"
              createdBy="admin"
            />
          )}

          {/* TAB 2: Bulk Import (Excel) */}
          {activeTab === "bulk" && (
            <div className="space-y-6">
              
              {/* Header card with template download */}
              <div className="bg-white rounded-3xl border border-orange-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
                    Bulk Party Worker Import
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Upload an Excel or CSV file to register multiple party workers instantly.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-orange-500 text-slate-700 text-sm font-semibold transition-all shadow-sm"
                >
                  <HiDownload className="w-4.5 h-4.5 text-orange-500" />
                  Download Excel Template
                </button>
              </div>

              {/* Upload Zone */}
              {!bulkFile && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/5/10 p-8 md:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <HiCloudUpload className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-slate-800 font-bold text-base mb-1">
                    Upload your spreadsheet file
                  </h3>
                  <p className="text-slate-400 text-xs max-w-sm mb-4">
                    Drag and drop your Excel (.xlsx, .xls) or CSV template file here, or click to browse files.
                  </p>
                  <span className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                    Select File
                  </span>
                </div>
              )}

              {/* Parsing State */}
              {isParsing && (
                <div className="bg-white rounded-3xl border border-orange-100 p-8 text-center shadow-sm">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3" />
                  <p className="text-slate-600 text-sm font-medium">Parsing and validating spreadsheet data...</p>
                </div>
              )}

              {/* Parsed & Validated Results Preview */}
              {bulkFile && !isParsing && (
                <div className="space-y-6">
                  
                  {/* File status card */}
                  <div className="bg-white rounded-3xl border border-orange-100 p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 font-semibold text-lg">
                        📄
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-sm leading-tight break-all">
                          {bulkFile.name}
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {(bulkFile.size / 1024).toFixed(1)} KB • {parsedRows.length} total rows parsed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetBulk}
                      className="px-3.5 py-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-xl text-slate-500 text-xs font-semibold transition-all"
                    >
                      Remove File
                    </button>
                  </div>

                  {/* Summary Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Valid Box */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-3">
                      <HiCheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-slate-800 font-bold text-base leading-tight">
                          {validWorkers.length} Valid Records
                        </h4>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                          These records pass all requirements and are ready to be imported.
                        </p>
                      </div>
                    </div>

                    {/* Invalid Box */}
                    <div className={`${invalidRows.length > 0 ? "bg-rose-50/50 border-rose-100" : "bg-slate-50 border-slate-100"} border rounded-3xl p-5 flex items-start gap-3`}>
                      <HiXCircle className={`w-6 h-6 ${invalidRows.length > 0 ? "text-rose-500" : "text-slate-400"} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="text-slate-800 font-bold text-base leading-tight">
                          {invalidRows.length} Invalid Records
                        </h4>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                          {invalidRows.length > 0
                            ? "These rows contain errors and will be skipped. You can fix them in your spreadsheet and upload again."
                            : "Excellent! There are no errors in this spreadsheet file."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Display Errors List */}
                  {invalidRows.length > 0 && (
                    <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
                      <div className="flex items-center gap-2 border-b border-rose-50 pb-2">
                        <span className="text-rose-500 font-bold">⚠️</span>
                        <h3 className="text-rose-900 font-extrabold text-sm uppercase tracking-wider">
                          Row Errors to Correct ({invalidRows.length})
                        </h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                        {invalidRows.map((errItem) => (
                          <div
                            key={errItem.rowNum}
                            className="p-3.5 bg-rose-50/30 border border-rose-100/50 rounded-2xl flex items-start gap-3 text-xs"
                          >
                            <span className="px-2 py-0.5 bg-rose-500 text-white rounded font-bold">
                              Row {errItem.rowNum}
                            </span>
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-700">
                                {errItem.worker.firstName || errItem.worker.lastName
                                  ? `${errItem.worker.firstName} ${errItem.worker.lastName}`
                                  : "Unnamed Worker"}
                              </p>
                              <ul className="list-disc pl-4 space-y-0.5 text-rose-600 font-medium">
                                {errItem.errors.map((errMsg, i) => (
                                  <li key={i}>{errMsg}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display Valid Rows Preview Table */}
                  {validWorkers.length > 0 && (
                    <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-orange-50 bg-orange-50/20 flex justify-between items-center">
                        <h3 className="text-slate-800 font-bold text-sm">
                          Valid Rows Preview ({validWorkers.length})
                        </h3>
                        <p className="text-slate-400 text-xs">First 10 records shown below</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                              <th className="p-3.5 pl-6 font-semibold">Name</th>
                              <th className="p-3.5 font-semibold">Mobile</th>
                              <th className="p-3.5 font-semibold">Position</th>
                              <th className="p-3.5 font-semibold">Village / City</th>
                              <th className="p-3.5 font-semibold">District</th>
                              <th className="p-3.5 pr-6 font-semibold">DOB</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                            {validWorkers.slice(0, 10).map((w, i) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                <td className="p-3.5 pl-6 font-bold text-slate-800">
                                  {w.firstName} {w.middleName ? `${w.middleName} ` : ""}{w.lastName}
                                </td>
                                <td className="p-3.5">{w.primaryPhone}</td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full font-semibold">
                                    {w.position}
                                  </span>
                                </td>
                                <td className="p-3.5">{w.village || "—"}</td>
                                <td className="p-3.5">{w.district || "—"}</td>
                                <td className="p-3.5 pr-6">{w.DOB || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Submission and Action Bar */}
                  <div className="flex justify-end items-center gap-3 pt-2">
                    <button
                      onClick={handleResetBulk}
                      className="px-6 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
                      disabled={isSubmitting}
                    >
                      Clear File
                    </button>
                    <button
                      onClick={handleBulkSubmit}
                      disabled={isSubmitting || validWorkers.length === 0}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 shadow-md shadow-orange-500/25 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Importing {validWorkers.length} Workers...
                        </>
                      ) : (
                        <>
                          <HiUserAdd className="w-5 h-5" />
                          Import {validWorkers.length} Workers
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
}

