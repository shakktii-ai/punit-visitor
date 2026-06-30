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

const EventRequestSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  eventOrganizer: { type: String, required: true },
  eventLocation: { type: String, required: true },
  description: { type: String, required: true },
  contactDetails: { type: String, default: "" },
  status: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected"] },
  remark: { type: String, default: "" },
  username: { type: String, required: true }, // The user who created the request
  image: { type: String, default: "" },
  reminderConfig: {
    oneDayBefore: { type: Boolean, default: false },
    twoHoursBefore: { type: Boolean, default: false },
    customTime: { type: Date, default: null }
  }
}, { timestamps: true });

export default mongoose.models.EventRequest || mongoose.model('EventRequest', EventRequestSchema);
