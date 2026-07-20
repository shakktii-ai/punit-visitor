import Form from "@/models/form";
import connectDb from "@/middleware/mongoose";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number is required." });
  }

  try {
    const visits = await Form.find({ phoneNo: phone }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, visits });
  } catch (error) {
    console.error("Error fetching visitor history:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch visitor history." });
  }
};

export default connectDb(handler);
