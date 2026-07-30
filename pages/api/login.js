import connectDb from "@/middleware/mongoose";
import Permission from "@/models/permission";
import User from "@/models/user";
import { logAuditEvent } from "@/lib/auditLogger";

// Hardcoded admin credentials (can be moved to env vars)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const USER_PASSWORD = process.env.USER_PASSWORD || "123456";

const ALLOWED_ADMINS = [
  process.env.ADMIN_USERNAME,
  "admin",
  "MKulkarni",
  "Deshmukh"
].filter(Boolean);

const ALLOWED_USERNAMES = [
  process.env.USER_USERNAME,
  "user@gmail.com",
  "OPathak",
  "MKulkarni",
  "Deshmukh",
  "NSavalgi",
  "DJadhav",
].filter(Boolean);

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // 1. Check admin credentials (hardcoded)
  if (ALLOWED_ADMINS.includes(username) && password === ADMIN_PASSWORD) {
    let allowedPages = [];
    if (username === "admin") {
      allowedPages = [
        "/admin",
        "/admin/visitorTable",
        "/admin/workers",
        "/admin/addWorker",
        "/admin/letters",
        "/admin/addLetter",
        "/admin/calendar",
        "/admin/event-requests",
        "/admin/logs"
      ];
    } else {
      const permObj = await Permission.findOne({ username });
      if (permObj) {
        allowedPages = permObj.allowedPages;
      } else {
        allowedPages = [
          "/admin",
          "/admin/visitorTable",
          "/admin/workers",
          "/admin/addWorker",
          "/admin/letters",
          "/admin/addLetter",
          "/admin/logs"
        ];
      }
    }

    await logAuditEvent({
      module: "Admin Auth",
      action: "LOGIN",
      performedBy: username,
      targetName: username,
      details: `Successful Admin login for user '${username}'`,
    });

    return res.status(200).json({ role: "admin", username, allowedPages, message: "Login successful" });
  }

  // 2. Check user credentials (hardcoded)
  if (ALLOWED_USERNAMES.includes(username) && password === USER_PASSWORD) {
    let allowedPages = [];
    const permObj = await Permission.findOne({ username });
    if (permObj) {
      allowedPages = permObj.allowedPages;
    } else {
      allowedPages = [
        "/form",
        "/my-submissions",
        "/invitations"
      ];
    }

    await logAuditEvent({
      module: "Admin Auth",
      action: "LOGIN",
      performedBy: username,
      targetName: username,
      details: `Successful user login for user '${username}'`,
    });

    return res.status(200).json({ role: "user", username, allowedPages, message: "Login successful" });
  }

  // 3. Check DB credentials fallback
  const dbUser = await User.findOne({ username });
  if (dbUser && dbUser.password === password) {
    let allowedPages = [];
    const permObj = await Permission.findOne({ username });
    if (permObj) {
      allowedPages = permObj.allowedPages;
    } else {
      if (dbUser.role === "admin") {
        allowedPages = [
          "/admin",
          "/admin/visitorTable",
          "/admin/workers",
          "/admin/addWorker",
          "/admin/letters",
          "/admin/addLetter"
        ];
      } else {
        allowedPages = [
          "/form",
          "/my-submissions",
          "/invitations"
        ];
      }
    }

    await logAuditEvent({
      module: "Admin Auth",
      action: "LOGIN",
      performedBy: username,
      targetName: username,
      details: `Successful login for user '${username}' (${dbUser.role})`,
    });

    return res.status(200).json({ role: dbUser.role, username: dbUser.username, allowedPages, message: "Login successful" });
  }

  await logAuditEvent({
    module: "Admin Auth",
    action: "LOGIN_FAILED",
    performedBy: username || "Unknown",
    targetName: username || "Unknown",
    details: `Failed login attempt for username '${username}'`,
  });

  return res.status(401).json({ error: "Invalid username or password." });
};

export default connectDb(handler);
