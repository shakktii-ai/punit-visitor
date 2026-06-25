import connectDb from "@/middleware/mongoose";

// Hardcoded admin credentials (can be moved to env vars)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const USER_PASSWORD = process.env.USER_PASSWORD || "123456";

const ALLOWED_USERNAMES = [
  process.env.USER_USERNAME,
  "user@gmail.com",
  "UJadhav",
  "YSangade",
  "RahulKokate",
  "MKokate",
  "SKokate",
  "SVavale",
  "PDevasthali",
  "RRaikar",
  "RDeshpande",
  "SBhote"
].filter(Boolean);

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
    return res.status(200).json({ role: "admin", username, message: "Login successful" });
  }

  // Check user credentials
  if (ALLOWED_USERNAMES.includes(username) && password === USER_PASSWORD) {
    return res.status(200).json({ role: "user", username, message: "Login successful" });
  }

  return res.status(401).json({ error: "Invalid username or password." });
};

export default connectDb(handler);
