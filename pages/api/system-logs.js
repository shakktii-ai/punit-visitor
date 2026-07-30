import mongoose from "mongoose";
import SystemLog from "@/models/systemLog";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  try {
    const { page = 1, limit = 15, search = "", moduleFilter = "", actionFilter = "", sort = "newest" } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (moduleFilter && moduleFilter !== "ALL") {
      query.module = moduleFilter;
    }

    if (actionFilter && actionFilter !== "ALL") {
      query.action = actionFilter;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { performedBy: searchRegex },
        { targetName: searchRegex },
        { details: searchRegex },
        { module: searchRegex },
      ];
    }

    const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const [logs, total, stats] = await Promise.all([
      SystemLog.find(query).sort(sortOrder).skip(skip).limit(limitNum).lean(),
      SystemLog.countDocuments(query),
      SystemLog.aggregate([
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statsMap = {
      total: total,
      createCount: 0,
      updateCount: 0,
      deleteCount: 0,
      statusCount: 0,
    };

    stats.forEach((st) => {
      if (st._id === "CREATE") statsMap.createCount = st.count;
      if (st._id === "UPDATE") statsMap.updateCount += st.count;
      if (st._id === "STATUS_CHANGE") statsMap.statusCount = st.count;
      if (st._id === "DELETE") statsMap.deleteCount = st.count;
    });

    return res.status(200).json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: statsMap,
    });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    return res.status(500).json({ error: "Failed to fetch system logs." });
  }
}
