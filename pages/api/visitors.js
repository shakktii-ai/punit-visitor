import Form from "@/models/form";
import connectDb from "@/middleware/mongoose";

const handler = async (req, res) => {
  // ── GET: list visitors with search, filter, pagination ────────────────
  if (req.method === "GET") {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        purpose = "",
        sort = "newest",
        addedBy = "",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const ALLOWED_ADMINS = ["admin", "MKulkarni", "Deshmukh"];
      const query = {};

      if (addedBy && !ALLOWED_ADMINS.includes(addedBy)) {
        query.addedBy = addedBy;
      }

      if (search) {
        query.$or = [
          { fullName:  { $regex: search, $options: "i" } },
          { phoneNo:   { $regex: search, $options: "i" } },
          { address:   { $regex: search, $options: "i" } },
          { village:   { $regex: search, $options: "i" } },
        ];
      }

      if (purpose) {
        query.purpose = purpose;
      }

      const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

      const [visitors, total] = await Promise.all([
        Form.find(query)
          .sort(sortOrder)
          .skip(skip)
          .limit(limitNum)
          .select(
            "photos fullName email phoneNo age sex DOB village purpose createdAt aadharVoter pincode addedBy status followUp address"
          ),
        Form.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        visitors,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching visitors:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch visitors." });
    }
  }

  // ── DELETE: remove a visitor by id ────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Visitor ID is required." });
      }
      const deleted = await Form.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Visitor not found." });
      }
      return res.status(200).json({ success: true, message: "Visitor deleted successfully." });
    } catch (error) {
      console.error("Error deleting visitor:", error);
      return res.status(500).json({ success: false, error: "Failed to delete visitor." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};

export default connectDb(handler);
