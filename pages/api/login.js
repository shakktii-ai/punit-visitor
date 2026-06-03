import connectDb from "@/middleware/mongoose";

// Hardcoded admin credentials (can be moved to env vars)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const USER_USERNAME  = process.env.USER_USERNAME  || "user";
const USER_PASSWORD  = process.env.USER_PASSWORD  || "user123";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Check admin credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ role: "admin", message: "Login successful" });
  }

  // Check user credentials
  if (username === USER_USERNAME && password === USER_PASSWORD) {
    return res.status(200).json({ role: "user", message: "Login successful" });
  }

  return res.status(401).json({ error: "Invalid username or password." });
};

export default connectDb(handler);
