import Visit from '@/models/form';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { logAuditEvent } from '@/lib/auditLogger';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Upload image to Cloudinary if it is in Base64 format and exists
    let photosUrl = '';
    if (data.photos) {
      photosUrl = await uploadToCloudinary(data.photos, 'visitors/photos');
    }

    let uploadedBeforeImages = [];
    if (Array.isArray(data.beforeImages) && data.beforeImages.length > 0) {
      uploadedBeforeImages = await Promise.all(
        data.beforeImages.map(async (img) => {
          if (img && img.startsWith('data:image')) {
            return await uploadToCloudinary(img, 'visitors/before_images');
          }
          return img;
        })
      );
    } else if (photosUrl) {
      uploadedBeforeImages = [photosUrl];
    }

    const newVisit = new Visit({
      photos: photosUrl || (uploadedBeforeImages[0] || ''),
      beforeImages: uploadedBeforeImages,
      afterImages: Array.isArray(data.afterImages) ? data.afterImages : [],
      fullName: data.fullName,
      phoneNo: data.phoneNo,
      sex: data.sex,
      visitMode: data.visitMode || '',
      address: data.address,
      purpose: data.purpose,
      subPurpose: data.subPurpose || '',
      customPurpose: data.customPurpose || '',
      customSubPurpose: data.customSubPurpose || '',
      addedBy: data.addedBy,
      status: data.status || 'Pending',
      followUp: data.followUp || '',
    });

    await newVisit.save();

    try {
      await logAuditEvent({
        module: "Visitors",
        action: "CREATE",
        performedBy: data.addedBy || "Admin",
        targetId: newVisit._id,
        targetName: newVisit.fullName || "Visitor",
        details: `New visitor registered for purpose: ${newVisit.purpose || "General Visit"}`,
      });
    } catch (auditErr) {
      console.error("Non-fatal audit log error:", auditErr);
    }

    return res.status(200).json({ success: true, message: 'Visit added successfully' });
  } catch (error) {
    console.error('Error adding visit:', error);
    return res.status(500).json({ success: false, message: 'Error adding visit' });
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default connectDb(handler);