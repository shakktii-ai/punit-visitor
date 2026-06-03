import mongoose from 'mongoose';
import Form from '@/models/form';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    try {
      await Form.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Visitor deleted successfully.' });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      return res.status(500).json({ error: 'Failed to delete visitor.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
