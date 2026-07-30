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

      // Prepare audit log entry
      const updaterName = updatedData.updatedBy || "Admin";
      const newStatus = updatedData.status;
      const newFollowUp = updatedData.followUp;
      let actionText = "Updated visitor details";
      let detailsText = "";

      if (updatedData.status === "Closing Request") {
        actionText = "Submitted Closing Request";
        detailsText = "Submitted closing request with completion details.";
      } else if (updatedData.status === "Completed") {
        actionText = "Status changed to Completed";
        detailsText = "Admin reviewed and marked visitor request as completed.";
      } else if (updatedData.status) {
        actionText = `Status changed to ${updatedData.status}`;
      }

      if (newFollowUp) {
        detailsText += detailsText ? ` | Remarks: ${newFollowUp}` : `Remarks: ${newFollowUp}`;
      }

      const logEntry = {
        updatedBy: updaterName,
        updatedAt: new Date(),
        action: actionText,
        status: newStatus || "",
        followUp: newFollowUp || "",
        details: detailsText || "Updated fields",
      };

      // Delete properties that conflict with $push or _id immutable field
      delete updatedData.updatedBy;
      delete updatedData.logs;
      delete updatedData._id;

      const visitor = await Form.findByIdAndUpdate(
        id,
        {
          ...updatedData,
          $push: { logs: logEntry },
        },
        { new: true }
      );

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
