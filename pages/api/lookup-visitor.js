import mongoose from "mongoose";
import Form from "@/models/form";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  try {
    // Find the most recent visit entry for this phone number
    const visitor = await Form.findOne({ phoneNo: phone }).sort({ createdAt: -1 });

    if (!visitor) {
      return res.status(404).json({ error: "No previous records found for this phone number." });
    }

    // Combine legacy address fields if address is not present
    const combinedAddress = visitor.address || [
      visitor.houseNo,
      visitor.landmark,
      visitor.village,
      visitor.pincode ? String(visitor.pincode) : ""
    ].filter((val) => val && val.trim() !== "").join(", ");

    const responseData = {
      photos: visitor.photos || "",
      fullName: visitor.fullName || "",
      phoneNo: visitor.phoneNo || "",
      sex: visitor.sex || "",
      address: combinedAddress,
      purpose: visitor.purpose || "",
      subPurpose: visitor.subPurpose || "",
      customPurpose: visitor.customPurpose || "",
      customSubPurpose: visitor.customSubPurpose || "",
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error looking up returning visitor:", error);
    return res.status(500).json({ error: "Server error occurred during lookup." });
  }
}
