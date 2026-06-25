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

const LetterSchema = new mongoose.Schema({
  photo: { type: String },
  details: { type: String },
  letterAddressedTo: { type: String },
  subject: { type: String, required: true },
  department: { type: String },
  inwardNumber: { type: String, required: true },
  assignedPerson: { type: String },
  contactNumber: { type: String },
  nextAction: { type: String },
  followUpDate: { type: Date },
  createdBy: { type: String, default: "admin", enum: ["admin", "user"] },
  addedBy: { type: String },
}, { timestamps: true });

export default mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
