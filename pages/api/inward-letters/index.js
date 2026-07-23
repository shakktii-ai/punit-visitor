import InwardLetter from "@/models/inward-letter";
import connectDb from "@/middleware/mongoose";
import { uploadToCloudinary } from "@/lib/cloudinary";

const handler = async (req, res) => {
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";
  const ALLOWED_ADMINS = ["admin", "MKulkarni", "Deshmukh"];
  const isAdmin = role === "admin" || ALLOWED_ADMINS.includes(username);

  // GET: list inward letters or get single inward letter by ID or get next auto-generated inward number
  if (req.method === "GET") {
    try {
      const { id, nextNumber } = req.query;

      if (nextNumber) {
        const letters = await InwardLetter.find({}).select("inwardNumber");
        let num = 1;
        if (letters && letters.length > 0) {
          const numbers = letters
            .map((l) => parseInt(l.inwardNumber, 10))
            .filter((n) => !isNaN(n) && n > 0);
          if (numbers.length > 0) {
            num = Math.max(...numbers) + 1;
          } else {
            num = letters.length + 1;
          }
        }
        return res.status(200).json({ success: true, nextNumber: String(num) });
      }

      if (id) {
        const letter = await InwardLetter.findById(id);
        if (!letter) {
          return res.status(404).json({ success: false, error: "Inward letter not found." });
        }
        if (!isAdmin && (letter.createdBy !== "user" || letter.addedBy !== username)) {
          return res.status(403).json({ success: false, error: "You are not authorized to view this inward letter." });
        }
        return res.status(200).json({ success: true, letter });
      }

      const {
        page = 1,
        limit = 10,
        search = "",
        sort = "newest",
        addedBy = "",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const query = {};

      if (role === "user" && !ALLOWED_ADMINS.includes(username)) {
        query.addedBy = username;
      } else if (addedBy) {
        query.addedBy = addedBy;
      }

      if (search) {
        query.$or = [
          { subject: { $regex: search, $options: "i" } },
          { inwardNumber: { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { senderName: { $regex: search, $options: "i" } },
          { assignedPerson: { $regex: search, $options: "i" } },
          { remark: { $regex: search, $options: "i" } },
        ];
      }

      const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

      const [letters, total] = await Promise.all([
        InwardLetter.find(query)
          .sort(sortOrder)
          .skip(skip)
          .limit(limitNum),
        InwardLetter.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        letters,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching inward letters:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch inward letters." });
    }
  }

  // PUT: update an existing inward letter
  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const data = req.body;
      const letterId = id || data.id || data._id;

      if (!letterId) {
        return res.status(400).json({ success: false, error: "Letter ID is required." });
      }

      const letter = await InwardLetter.findById(letterId);
      if (!letter) {
        return res.status(404).json({ success: false, error: "Inward letter not found." });
      }

      // Enforce permissions: Admin can edit all, User can only edit their own
      if (!isAdmin) {
        if (letter.createdBy !== "user" || letter.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to edit this inward letter." });
        }
      }

      // Upload new photo if it's base64 data and changed
      let photoUrl = letter.photo;
      if (data.photo && data.photo !== letter.photo) {
        photoUrl = await uploadToCloudinary(data.photo, 'inward-letters');
      }

      const updatedFields = {
        photo: photoUrl,
        inwardDate: data.inwardDate,
        inwardNumber: data.inwardNumber,
        subject: data.subject,
        senderName: data.senderName,
        senderContact: data.senderContact,
        department: data.department,
        assignedPerson: data.assignedPerson,
        actionTaken: data.actionTaken,
        status: data.status,
        remark: data.remark,
      };

      const updatedLetter = await InwardLetter.findByIdAndUpdate(letterId, updatedFields, { new: true });
      return res.status(200).json({ success: true, letter: updatedLetter, message: "Inward letter updated successfully." });
    } catch (error) {
      console.error("Error updating inward letter:", error);
      return res.status(500).json({ success: false, error: "Failed to update inward letter." });
    }
  }

  // DELETE: remove an inward letter by id
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Letter ID is required." });
      }

      const letter = await InwardLetter.findById(id);
      if (!letter) {
        return res.status(404).json({ success: false, error: "Inward letter not found." });
      }

      // Enforce permissions: Admin can delete all, User can only delete their own
      if (!isAdmin) {
        if (letter.createdBy !== "user" || letter.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to delete this inward letter." });
        }
      }

      await InwardLetter.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Inward letter deleted successfully." });
    } catch (error) {
      console.error("Error deleting inward letter:", error);
      return res.status(500).json({ success: false, error: "Failed to delete inward letter." });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default connectDb(handler);
