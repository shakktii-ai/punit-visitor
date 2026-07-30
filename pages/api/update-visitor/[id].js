import mongoose from 'mongoose';
import Form from '@/models/form';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const updatedData = req.body;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    try {
      if (updatedData.photos && updatedData.photos.startsWith('data:image')) {
        updatedData.photos = await uploadToCloudinary(updatedData.photos, 'visitors/photos');
      }

      if (Array.isArray(updatedData.afterImages) && updatedData.afterImages.length > 0) {
        updatedData.afterImages = await Promise.all(
          updatedData.afterImages.map(async (img) => {
            if (img && img.startsWith('data:image')) {
              return await uploadToCloudinary(img, 'visitors/after_images');
            }
            return img;
          })
        );
      }

      if (Array.isArray(updatedData.beforeImages) && updatedData.beforeImages.length > 0) {
        updatedData.beforeImages = await Promise.all(
          updatedData.beforeImages.map(async (img) => {
            if (img && img.startsWith('data:image')) {
              return await uploadToCloudinary(img, 'visitors/before_images');
            }
            return img;
          })
        );
      }

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
