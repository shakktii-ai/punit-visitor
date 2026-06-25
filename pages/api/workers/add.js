import Worker from '@/models/worker';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Upload worker photo to Cloudinary
    let photoUrl = "";
    if (data.photo) {
      photoUrl = await uploadToCloudinary(data.photo, 'workers');
    }

    const newWorker = new Worker({
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
      createdBy: data.createdBy || 'admin',
      addedBy: data.addedBy || '',
    });

    await newWorker.save();

    return res.status(200).json({ success: true, message: 'Worker registered successfully' });
  } catch (error) {
    console.error('Error registering worker:', error);
    return res.status(500).json({ success: false, message: 'Error registering worker' });
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default connectDb(handler);
