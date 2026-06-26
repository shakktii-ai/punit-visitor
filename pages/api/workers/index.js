import Worker from "@/models/worker";
import connectDb from "@/middleware/mongoose";
import { uploadToCloudinary } from "@/lib/cloudinary";

const handler = async (req, res) => {
  const role = req.headers["x-user-role"] || "";
  const username = req.headers["x-username"] || "";
  const ALLOWED_ADMINS = ["admin", "MKulkarni", "Deshmukh"];
  const isAdmin = role === "admin" || ALLOWED_ADMINS.includes(username);

  // ── GET: list workers with search, filter, pagination ────────────────
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      if (id) {
        const worker = await Worker.findById(id);
        if (!worker) {
          return res.status(404).json({ success: false, error: "Worker not found." });
        }
        if (!isAdmin && (worker.createdBy !== "user" || worker.addedBy !== username)) {
          return res.status(403).json({ success: false, error: "You are not authorized to view this worker." });
        }
        return res.status(200).json({ success: true, worker });
      }

      const {
        page = 1,
        limit = 10,
        search = "",
        position = "",
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
          { firstName: { $regex: search, $options: "i" } },
          { middleName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { primaryPhone: { $regex: search, $options: "i" } },
          { alternativePhone: { $regex: search, $options: "i" } },
          { village: { $regex: search, $options: "i" } },
          { areaNameOrBooth: { $regex: search, $options: "i" } },
          { position: { $regex: search, $options: "i" } },
        ];
      }

      if (position) {
        query.position = position;
      }

      const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

      const [workers, total] = await Promise.all([
        Worker.find(query)
          .sort(sortOrder)
          .skip(skip)
          .limit(limitNum),
        Worker.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        workers,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching workers:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch workers." });
    }
  }

  // ── PUT: update an existing worker ───────────────────────────────────
  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const data = req.body;
      const workerId = id || data.id || data._id;

      if (!workerId) {
        return res.status(400).json({ success: false, error: "Worker ID is required." });
      }

      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ success: false, error: "Worker not found." });
      }

      // Enforce permissions: Admin can edit all, User can only edit their own
      if (!isAdmin) {
        if (worker.createdBy !== "user" || worker.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to edit this worker." });
        }
      }

      // Upload new photo if it's base64 data and changed
      let photoUrl = worker.photo;
      if (data.photo && data.photo !== worker.photo) {
        photoUrl = await uploadToCloudinary(data.photo, 'workers');
      }

      const updatedFields = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        houseNo: data.houseNo,
        street: data.street,
        village: data.village,
        taluka: data.taluka,
        district: data.district,
        pincode: data.pincode,
        primaryPhone: data.primaryPhone,
        alternativePhone: data.alternativePhone,
        position: data.position,
        areaNameOrBooth: data.areaNameOrBooth,
        DOB: data.DOB,
        maritalStatus: data.maritalStatus,
        spouseName: data.spouseName,
        spouseDOB: data.spouseDOB,
        anniversaryDate: data.anniversaryDate,
        fatherName: data.fatherName,
        fatherDOB: data.fatherDOB,
        motherName: data.motherName,
        motherDOB: data.motherDOB,
        parentsAnniversaryDate: data.parentsAnniversaryDate,
        photo: photoUrl,
      };

      const updatedWorker = await Worker.findByIdAndUpdate(workerId, updatedFields, { new: true });
      return res.status(200).json({ success: true, worker: updatedWorker, message: "Worker updated successfully." });
    } catch (error) {
      console.error("Error updating worker:", error);
      return res.status(500).json({ success: false, error: "Failed to update worker." });
    }
  }

  // ── DELETE: remove a worker by id ────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Worker ID is required." });
      }

      const worker = await Worker.findById(id);
      if (!worker) {
        return res.status(404).json({ success: false, error: "Worker not found." });
      }

      // Enforce permissions: Admin can delete all, User can only delete their own
      if (!isAdmin) {
        if (worker.createdBy !== "user" || worker.addedBy !== username) {
          return res.status(403).json({ success: false, error: "You are not authorized to delete this worker." });
        }
      }

      await Worker.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Worker deleted successfully." });
    } catch (error) {
      console.error("Error deleting worker:", error);
      return res.status(500).json({ success: false, error: "Failed to delete worker." });
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
