import connectDb from "@/middleware/mongoose";
import Permission from "@/models/permission";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required." });
    }

    if (username === "admin") {
      const allPages = [
        "/admin",
        "/admin/visitorTable",
        "/admin/workers",
        "/admin/addWorker",
        "/admin/letters",
        "/admin/addLetter",
        "/admin/calendar",
        "/admin/event-requests"
      ];
      return res.status(200).json({ success: true, allowedPages: allPages });
    }

    const perm = await Permission.findOne({ username });
    if (perm) {
      return res.status(200).json({ success: true, allowedPages: perm.allowedPages });
    }

    // Default permissions if no DB record exists
    const defaultPages = [
      "/admin",
      "/admin/visitorTable",
      "/admin/workers",
      "/admin/addWorker",
      "/admin/letters",
      "/admin/addLetter"
    ];
    return res.status(200).json({ success: true, allowedPages: defaultPages });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return res.status(500).json({ success: false, error: "Server error." });
  }
};

export default connectDb(handler);
