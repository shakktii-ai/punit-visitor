import connectDb from "@/middleware/mongoose";
import Permission from "@/models/permission";
import User from "@/models/user";

const HARDCODED_ADMINS = ["MKulkarni", "Deshmukh"];
const HARDCODED_USERS = ["user@gmail.com", "OPathak", "MKulkarni", "Deshmukh", "NSavalgi", "DJadhav"];

const handler = async (req, res) => {
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";

  // Only super-admin "admin" can manage permissions
  if (role !== "admin" || username !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Only super-admin can manage permissions." });
  }

  // GET: Fetch permissions for all sub-admins and normal users
  if (req.method === "GET") {
    try {
      const dbUsers = await User.find({});
      const dynamicAdmins = dbUsers.filter(u => u.role === "admin").map(u => u.username);
      const dynamicUsers = dbUsers.filter(u => u.role === "user").map(u => u.username);

      const adminsList = Array.from(new Set([...HARDCODED_ADMINS, ...dynamicAdmins]));
      const usersList = Array.from(new Set([...HARDCODED_USERS, ...dynamicUsers]));

      const allUsernames = [...adminsList, ...usersList];
      const records = await Permission.find({ username: { $in: allUsernames } });
      
      const recordMap = {};
      records.forEach(rec => {
        recordMap[rec.username] = rec.allowedPages;
      });

      const dbUserSet = new Set(dbUsers.map(u => u.username));

      const subAdminsData = adminsList.map(u => ({
        username: u,
        allowedPages: recordMap[u] || [
          "/admin",
          "/admin/visitorTable",
          "/admin/workers",
          "/admin/addWorker",
          "/admin/letters",
          "/admin/addLetter",
          "/admin/inward-letters",
          "/admin/addInwardLetter"
        ],
        isDynamic: dbUserSet.has(u)
      }));

      const normalUsersData = usersList.map(u => ({
        username: u,
        allowedPages: recordMap[u] || [
          "/form",
          "/my-submissions",
          "/workers",
          "/letters",
          "/inward-letters",
          "/invitations"
        ],
        isDynamic: dbUserSet.has(u)
      }));

      return res.status(200).json({ success: true, subAdmins: subAdminsData, normalUsers: normalUsersData });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch permissions." });
    }
  }

  // POST: Create or Update permissions for a specific user
  if (req.method === "POST") {
    try {
      const { targetUsername, allowedPages } = req.body;
      if (!targetUsername || !Array.isArray(allowedPages)) {
        return res.status(400).json({ success: false, error: "Username and allowedPages array are required." });
      }

      const updatedRecord = await Permission.findOneAndUpdate(
        { username: targetUsername },
        { allowedPages },
        { new: true, upsert: true }
      );

      return res.status(200).json({ success: true, message: "Permissions updated successfully.", record: updatedRecord });
    } catch (error) {
      console.error("Error saving permissions:", error);
      return res.status(500).json({ success: false, error: "Failed to save permissions." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};

export default connectDb(handler);
