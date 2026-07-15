import Visit from '@/models/form';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

    const newVisit = new Visit({
      photos: photosUrl,
      fullName: data.fullName,
      phoneNo: data.phoneNo,
      sex: data.sex,
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