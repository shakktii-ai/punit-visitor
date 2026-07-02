import Worker from "@/models/worker";
import connectDb from "@/middleware/mongoose";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // 1. Authorization checks (consistent with other admin endpoints)
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";
  const ALLOWED_ADMINS = ["admin", "MKulkarni", "Deshmukh"];
  const isAdmin = role === "admin" || ALLOWED_ADMINS.includes(username);

  if (!isAdmin) {
    return res.status(403).json({ success: false, message: "Unauthorized access." });
  }

  try {
    const { workers } = req.body;
    if (!workers || !Array.isArray(workers) || workers.length === 0) {
      return res.status(400).json({ success: false, message: "No worker records provided." });
    }

    const validWorkers = [];
    const errors = [];

    // Valid positions list for checking
    const VALID_POSITIONS = [
      "Booth Head",
      "Shakti Kendra Head",
      "Mandal President",
      "Mandal General Secretary",
      "City Vice President",
      "District Executive Member",
      "Worker",
      "Party Worker"
    ];

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];
      const rowNum = i + 2; // Assuming row 1 is header row

      // Validate required fields
      if (!w.firstName || !w.firstName.trim()) {
        errors.push(`Row ${rowNum}: First Name is required.`);
        continue;
      }
      if (!w.lastName || !w.lastName.trim()) {
        errors.push(`Row ${rowNum}: Last Name is required.`);
        continue;
      }
      if (!w.primaryPhone) {
        errors.push(`Row ${rowNum}: Primary Mobile is required.`);
        continue;
      }
      
      const phoneStr = w.primaryPhone.toString().trim();
      if (!/^\d{10}$/.test(phoneStr)) {
        errors.push(`Row ${rowNum}: Primary Mobile must be exactly 10 digits.`);
        continue;
      }

      if (!w.position || !w.position.trim()) {
        errors.push(`Row ${rowNum}: Position is required.`);
        continue;
      }

      // Check if position matches allowed list (case-insensitive)
      let posValue = w.position.trim();
      const matchedPos = VALID_POSITIONS.find(
        (vp) => vp.toLowerCase() === posValue.toLowerCase()
      );
      if (!matchedPos) {
        errors.push(`Row ${rowNum}: Invalid Position '${posValue}'.`);
        continue;
      }

      // Sanitize position field to match canonical database values
      // Note: "Worker" translates to database "Worker" which maps to UI "Party Worker"
      let finalPosition = matchedPos;
      if (finalPosition === "Party Worker") {
        finalPosition = "Worker";
      }

      // Optional phone validation
      let altPhone = "";
      if (w.alternativePhone) {
        const altPhoneStr = w.alternativePhone.toString().trim();
        if (altPhoneStr) {
          if (!/^\d{10}$/.test(altPhoneStr)) {
            errors.push(`Row ${rowNum}: Alternative Mobile must be exactly 10 digits.`);
            continue;
          }
          altPhone = altPhoneStr;
        }
      }

      // Optional pincode validation
      let pinNum = undefined;
      if (w.pincode) {
        const pinStr = w.pincode.toString().trim();
        if (pinStr) {
          if (!/^\d{6}$/.test(pinStr)) {
            errors.push(`Row ${rowNum}: Pincode must be exactly 6 digits.`);
            continue;
          }
          pinNum = parseInt(pinStr, 10);
        }
      }

      // Safe date parser
      const parseDate = (d) => {
        if (!d) return undefined;
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      };

      // Construct DB object
      const newWorkerData = {
        firstName: w.firstName.trim(),
        middleName: w.middleName ? w.middleName.trim() : "",
        lastName: w.lastName.trim(),
        houseNo: w.houseNo ? w.houseNo.toString().trim() : "",
        street: w.street ? w.street.trim() : "",
        village: w.village ? w.village.trim() : "",
        taluka: w.taluka ? w.taluka.trim() : "",
        district: w.district ? w.district.trim() : "",
        pincode: pinNum,
        primaryPhone: phoneStr,
        alternativePhone: altPhone,
        position: finalPosition,
        areaNameOrBooth: w.areaNameOrBooth ? w.areaNameOrBooth.toString().trim() : "",
        DOB: parseDate(w.DOB),
        maritalStatus: w.maritalStatus ? w.maritalStatus.trim() : "",
        spouseName: w.spouseName ? w.spouseName.trim() : "",
        spouseDOB: parseDate(w.spouseDOB),
        anniversaryDate: parseDate(w.anniversaryDate),
        fatherName: w.fatherName ? w.fatherName.trim() : "",
        fatherDOB: parseDate(w.fatherDOB),
        motherName: w.motherName ? w.motherName.trim() : "",
        motherDOB: parseDate(w.motherDOB),
        parentsAnniversaryDate: parseDate(w.parentsAnniversaryDate),
        photo: "", // photos not uploaded via Excel bulk import
        createdBy: "admin",
        addedBy: username || "admin",
      };

      validWorkers.push(newWorkerData);
    }

    if (errors.length > 0) {
      // If there are errors, return them so client can display them
      return res.status(400).json({
        success: false,
        message: "Validation errors encountered in the spreadsheet.",
        errors,
      });
    }

    if (validWorkers.length === 0) {
      return res.status(400).json({ success: false, message: "No valid worker records to import." });
    }

    // Insert all valid workers
    const inserted = await Worker.insertMany(validWorkers);

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${inserted.length} party workers.`,
      count: inserted.length,
    });
  } catch (error) {
    console.error("Error in bulk-add worker API:", error);
    return res.status(500).json({ success: false, message: "Internal server error during bulk import." });
  }
};

export default connectDb(handler);
