import mongoose from 'mongoose';
import Form from '@/models/form';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const updatedData = req.body;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    try {
      const visitor = await Form.findByIdAndUpdate(id, updatedData, { new: true });

      if (!visitor) {
        return res.status(404).json({ error: 'Visitor not found.' });
      }

      return res.status(200).json(visitor);
    } catch (error) {
      console.error('Error updating visitor:', error);
      return res.status(500).json({ error: 'Failed to update visitor.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
