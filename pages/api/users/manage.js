import connectDb from "@/middleware/mongoose";
import User from "@/models/user";
import Permission from "@/models/permission";

const handler = async (req, res) => {
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";

  // Only super-admin "admin" can manage users
  if (role !== "admin" || username !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Only super-admin can manage users." });
  }

  // POST: Create a new user
  if (req.method === "POST") {
    try {
      const { newUsername, newPassword, newRole } = req.body;
      if (!newUsername || !newPassword || !newRole) {
        return res.status(400).json({ success: false, error: "All fields are required." });
      }

      if (newUsername.toLowerCase() === "admin") {
        return res.status(400).json({ success: false, error: "Cannot create user with username 'admin'." });
      }

      // Check if user already exists in DB
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Username already exists." });
      }

      const newUser = new User({
        username: newUsername,
        password: newPassword,
        role: newRole
      });

      await newUser.save();

      // Create default permission record
      let defaultPages = [];
      if (newRole === "admin") {
        defaultPages = [
          "/admin",
          "/admin/visitorTable",
          "/admin/workers",
          "/admin/addWorker",
          "/admin/letters",
          "/admin/addLetter"
        ];
      } else {
        defaultPages = [
          "/form",
          "/my-submissions",
          "/workers",
          "/letters",
          "/invitations"
        ];
      }

      const newPerm = new Permission({
        username: newUsername,
        allowedPages: defaultPages
      });
      await newPerm.save();

      return res.status(200).json({ success: true, message: "User created successfully." });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ success: false, error: "Failed to create user." });
    }
  }

  // DELETE: Delete a dynamic user
  if (req.method === "DELETE") {
    try {
      const { targetUsername } = req.query;
      if (!targetUsername) {
        return res.status(400).json({ success: false, error: "Username is required." });
      }

      await User.findOneAndDelete({ username: targetUsername });
      await Permission.findOneAndDelete({ username: targetUsername });

      return res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ success: false, error: "Failed to delete user." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};

export default connectDb(handler);
