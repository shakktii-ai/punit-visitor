import connectDb from "@/middleware/mongoose";
import Form from "@/models/form";
import Worker from "@/models/worker";
import InwardLetter from "@/models/inward-letter";
import Letter from "@/models/letter";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const role = req.headers["x-user-role"] || req.query.role || "";
  if (role !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Admin role required." });
  }

  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(200).json({
      success: true,
      results: {
        visitors: [],
        workers: [],
        inwardLetters: [],
        outwardLetters: []
      }
    });
  }

  try {
    const searchRegex = { $regex: q.trim(), $options: "i" };

    const [visitors, workers, inwardLetters, outwardLetters] = await Promise.all([
      // Query 1: Visitors
      Form.find({
        $or: [
          { fullName: searchRegex },
          { phoneNo: searchRegex },
          { address: searchRegex },
          { purpose: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20),

      // Query 2: Workers
      Worker.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { middleName: searchRegex },
          { primaryPhone: searchRegex },
          { alternativePhone: searchRegex },
          { position: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20),

      // Query 3: Inward Letters
      InwardLetter.find({
        $or: [
          { inwardNumber: searchRegex },
          { subject: searchRegex },
          { senderName: searchRegex },
          { senderContact: searchRegex },
          { department: searchRegex },
          { assignedPerson: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20),

      // Query 4: Outward Letters (Letter Schema uses inwardNumber field name)
      Letter.find({
        $or: [
          { inwardNumber: searchRegex },
          { subject: searchRegex },
          { letterAddressedTo: searchRegex },
          { contactNumber: searchRegex },
          { department: searchRegex },
          { assignedPerson: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    return res.status(200).json({
      success: true,
      results: {
        visitors,
        workers,
        inwardLetters,
        outwardLetters
      }
    });
  } catch (error) {
    console.error("Global search API error:", error);
    return res.status(500).json({ success: false, error: "Database search failed." });
  }
};

export default connectDb(handler);
