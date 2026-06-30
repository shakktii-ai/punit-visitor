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

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
