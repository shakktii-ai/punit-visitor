import Form from '@/models/form';
import connectDb from '@/middleware/mongoose';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [totalVisitors, todayVisitors, purposeBreakdown, recentVisitors, weeklyData] =
      await Promise.all([
        Form.countDocuments(),

        Form.countDocuments({ createdAt: { $gte: startOfToday } }),

        Form.aggregate([
          { $group: { _id: '$purpose', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        Form.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('fullName phoneNo village purpose photos createdAt'),

        Form.aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      totalVisitors,
      todayVisitors,
      purposeBreakdown,
      recentVisitors,
      weeklyData,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

export default connectDb(handler);
