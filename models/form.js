import mongoose from 'mongoose';

// Force Node.js to use public DNS servers to resolve MongoDB Atlas SRV connection strings on Windows/server side
if (typeof window === "undefined") {
  try {
    const dns = eval("require")('dns');
    // if (dns && typeof dns.setServers === "function") {
    //   dns.setServers(["8.8.8.8", "1.1.1.1"]);
    // }
    if (dns && typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (err) {
    console.warn("dns module not loaded", err);
  }
}

const FormDataSchema = new mongoose.Schema({
  photos: String,
  fullName: String,
  email: String,
  phoneNo: String,
  age: Number,
  sex: String,
  DOB: Date,
  aadharVoter: String,
  houseNo: String,
  landmark: String,
  village: String,
  pincode: Number,
  purpose: String,
  patiantName: String,
  hospitalName: String,
  trackingDoctor: String,
  reason: String,
  studentName: String,
  studentDOB: Date,
  studentGender: String,
  studentCategory: String,
  studentPhoto: String,
  jobFullName: String,
  jobPosition: String,
  jobDepartment: String,
  jobLocation: String,
  jobSalary: Number,
  employeeName: String,
  employeeId: String,
  employeeDepartment: String,
  employeeDesignation: String,
  employeeRDepartment: String,
  employeeRTransfer: String,
  schemeName: String,
  schemePApplication: String,
  schemeApplyDate: Date,
  schemeMaritalStatus: String,
  schemeCategary: String,
  schemeAddhar: String,
  businessName: String,
  businessType: String,
  businessSector: String,
  businessRNo: String,
  businessDOE: Date,
  businessGST: String,
  businessAddress: String,
  utilityServiceInstallation: String,
  utilityProblem: String,
  policeApplicationNo: String,
  policeApplicationDate: Date,
  policeApplicationPlace: String,
  policeIncidentDetails: String,
  policeInvolveName: String,
  policeDeclaration: String,
  policePhoto: String,
  projectName: String,
  projectLocation: String,
  projectProblem: String,
  message: String,
  addedBy: String,
  status: { type: String, default: "Pending" },
  followUp: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models.FormData || mongoose.model('FormData', FormDataSchema);
