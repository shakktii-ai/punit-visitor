import mongoose from 'mongoose';
import Form from '@/models/form';
import { logAuditEvent } from '@/lib/auditLogger';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    try {
      const visitor = await Form.findById(id);
      const visitorName = visitor ? visitor.fullName : id;

      await Form.findByIdAndDelete(id);

      await logAuditEvent({
        module: "Visitors",
        action: "DELETE",
        performedBy: "Admin",
        targetId: id,
        targetName: visitorName,
        details: `Deleted visitor record: ${visitorName}`,
      });

      return res.status(200).json({ message: 'Visitor deleted successfully.' });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      return res.status(500).json({ error: 'Failed to delete visitor.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
