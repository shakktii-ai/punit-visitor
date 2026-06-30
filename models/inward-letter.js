import mongoose from 'mongoose';

// Force Node.js to use public DNS servers to resolve MongoDB Atlas SRV connection strings on Windows/server side
if (typeof window === "undefined") {
  try {
    const dns = eval("require")('dns');
    if (dns && typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (err) {
    console.warn("dns module not loaded", err);
  }
}

const InwardLetterSchema = new mongoose.Schema({
  photo: { type: String }, // Letter/Document photo
  inwardDate: { type: Date, required: true }, // Inward Date
  inwardNumber: { type: String, required: true }, // Inward No.
  subject: { type: String, required: true }, // Subject
  senderName: { type: String }, // From whom received
  senderContact: { type: String }, // Contact of sender
  department: { type: String }, // Department
  assignedPerson: { type: String }, // Assigned Person
  actionTaken: { type: String }, // Action Taken
  status: { type: String, default: "Pending", enum: ["Pending", "In Progress", "Completed"] }, // Status
  remark: { type: String }, // Remark
  createdBy: { type: String, default: "admin", enum: ["admin", "user"] },
  addedBy: { type: String },
}, { timestamps: true });

export default mongoose.models.InwardLetter || mongoose.model('InwardLetter', InwardLetterSchema);
