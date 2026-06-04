import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use public DNS servers (Google/Cloudflare) to resolve MongoDB Atlas SRV connection strings
if (dns && typeof dns.setServers === "function") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// Force Node.js to prefer IPv4 DNS resolution to fix MongoDB Atlas SRV lookup issues on Windows
if (dns && typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
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
  state: String,
  nation: String,
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
}, { timestamps: true });

export default mongoose.models.FormData || mongoose.model('FormData', FormDataSchema);
