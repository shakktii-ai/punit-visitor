import mongoose from "mongoose";
import SystemLog from "@/models/systemLog";

/**
 * Log a system audit event
 * @param {Object} event
 * @param {string} event.module - "Visitors", "Workers", "Letters", "Inward Letters", "Event Requests", "Permissions"
 * @param {string} event.action - "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "PERMISSION_CHANGE"
 * @param {string} [event.performedBy] - Name/username of actor
 * @param {string} [event.targetId] - ID of affected entity
 * @param {string} [event.targetName] - Name or title of affected entity
 * @param {string} [event.details] - Description of changes/action
 */
export async function logAuditEvent(eventData) {
  try {
    if (!mongoose.connections[0].readyState && process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const {
      module = "Visitors",
      action = "CREATE",
      performedBy = "Admin",
      targetId = "",
      targetName = "",
      details = "",
    } = eventData || {};

    await SystemLog.create({
      module: module || "General",
      action: action || "CREATE",
      performedBy: String(performedBy || "Admin"),
      targetId: targetId ? String(targetId) : "",
      targetName: String(targetName || "Item"),
      details: String(details || ""),
    });
  } catch (error) {
    console.error("Failed to record system audit log (non-fatal):", error);
  }
}
