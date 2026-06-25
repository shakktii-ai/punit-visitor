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

const WorkerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  houseNo: { type: String },
  street: { type: String },
  village: { type: String },
  taluka: { type: String },
  district: { type: String },
  pincode: { type: Number },
  primaryPhone: { type: String, required: true },
  alternativePhone: { type: String },
  position: { type: String, required: true },
  areaNameOrBooth: { type: String },
  DOB: { type: Date },
  maritalStatus: { type: String },
  spouseName: { type: String },
  spouseDOB: { type: Date },
  anniversaryDate: { type: Date },
  fatherName: { type: String },
  fatherDOB: { type: Date },
  motherName: { type: String },
  motherDOB: { type: Date },
  parentsAnniversaryDate: { type: Date },
  photo: { type: String },
  createdBy: { type: String, default: "admin", enum: ["admin", "user"] },
  addedBy: { type: String },
}, { timestamps: true });

export default mongoose.models.Worker || mongoose.model('Worker', WorkerSchema);
