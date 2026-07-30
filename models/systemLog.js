import mongoose from "mongoose";

const SystemLogSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: ["Visitors", "Workers", "Letters", "Inward Letters", "Event Requests", "Permissions", "Admin Auth", "General"],
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "PERMISSION_CHANGE", "LOGIN", "LOGIN_FAILED", "LOGOUT"],
    },
    performedBy: {
      type: String,
      default: "Admin",
    },
    targetId: {
      type: String,
      default: "",
    },
    targetName: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SystemLog || mongoose.model("SystemLog", SystemLogSchema);
