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

const PermissionSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  allowedPages: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);
