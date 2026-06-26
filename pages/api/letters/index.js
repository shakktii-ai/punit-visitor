import Letter from "@/models/letter";
import connectDb from "@/middleware/mongoose";
import { uploadToCloudinary } from "@/lib/cloudinary";

const handler = async (req, res) => {
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";
  const ALLOWED_ADMINS = ["admin", "MKulkarni", "Deshmukh"];
  const isAdmin = role === "admin" || ALLOWED_ADMINS.includes(username);

  // ── GET: list letters or get single letter by ID ──────────────────────
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (id) {
        const letter = await Letter.findById(id);
        if (!letter) {
          return res.status(404).json({ success: false, error: "Letter not found." });
        }
        if (!isAdmin && (letter.createdBy !== "user" || letter.addedBy !== username)) {
          return res.status(403).json({ success: false, error: "You are not authorized to view this letter." });
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
          { letterAddressedTo: { $regex: search, $options: "i" } },
          { assignedPerson: { $regex: search, $options: "i" } },
          { details: { $regex: search, $options: "i" } },
        ];
      }

      const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

      const [letters, total] = await Promise.all([
        Letter.find(query)
          .sort(sortOrder)
          .skip(skip)
          .limit(limitNum),
        Letter.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        letters,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching letters:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch letters." });
    }
  }

  // ── PUT: update an existing letter ───────────────────────────────────
  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const data = req.body;
      const letterId = id || data.id || data._id;

      if (!letterId) {
        return res.status(400).json({ success: false, error: "Letter ID is required." });
      }

      const letter = await Letter.findById(letterId);
      if (!letter) {
        return res.status(404).json({ success: false, error: "Letter not found." });
      }

      // Enforce permissions: Admin can edit all, User can only edit their own
      if (!isAdmin) {
        if (letter.createdBy !== "user" || letter.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to edit this letter." });
        }
      }

      // Upload new photo if it's base64 data and changed
      let photoUrl = letter.photo;
      if (data.photo && data.photo !== letter.photo) {
        photoUrl = await uploadToCloudinary(data.photo, 'letters');
      }

      const updatedFields = {
        photo: photoUrl,
        details: data.details,
        letterAddressedTo: data.letterAddressedTo,
        subject: data.subject,
        department: data.department,
        inwardNumber: data.inwardNumber,
        assignedPerson: data.assignedPerson,
        contactNumber: data.contactNumber,
        nextAction: data.nextAction,
        followUpDate: data.followUpDate,
      };

      const updatedLetter = await Letter.findByIdAndUpdate(letterId, updatedFields, { new: true });
      return res.status(200).json({ success: true, letter: updatedLetter, message: "Letter updated successfully." });
    } catch (error) {
      console.error("Error updating letter:", error);
      return res.status(500).json({ success: false, error: "Failed to update letter." });
    }
  }

  // ── DELETE: remove a letter by id ────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Letter ID is required." });
      }

      const letter = await Letter.findById(id);
      if (!letter) {
        return res.status(404).json({ success: false, error: "Letter not found." });
      }

      // Enforce permissions: Admin can delete all, User can only delete their own
      if (!isAdmin) {
        if (letter.createdBy !== "user" || letter.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to delete this letter." });
        }
      }

      await Letter.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Letter deleted successfully." });
    } catch (error) {
      console.error("Error deleting letter:", error);
      return res.status(500).json({ success: false, error: "Failed to delete letter." });
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
