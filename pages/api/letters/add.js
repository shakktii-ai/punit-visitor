import Letter from '@/models/letter';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Upload letter photo to Cloudinary
    let photoUrl = "";
    if (data.photo) {
      photoUrl = await uploadToCloudinary(data.photo, 'letters');
    }

    // Auto-generate outward number starting from 1 if not provided
    let finalOutwardNumber = data.inwardNumber;
    if (!finalOutwardNumber || !finalOutwardNumber.toString().trim()) {
      const letters = await Letter.find({}).select("inwardNumber");
      let num = 1;
      if (letters && letters.length > 0) {
        const numbers = letters
          .map((l) => parseInt(l.inwardNumber, 10))
          .filter((n) => !isNaN(n) && n > 0);
        if (numbers.length > 0) {
          num = Math.max(...numbers) + 1;
        } else {
          num = letters.length + 1;
        }
      }
      finalOutwardNumber = String(num);
    }

    const newLetter = new Letter({
      photo: photoUrl,
      details: data.details,
      letterAddressedTo: data.letterAddressedTo,
      subject: data.subject,
      department: data.department,
      inwardNumber: finalOutwardNumber,
      assignedPerson: data.assignedPerson,
      contactNumber: data.contactNumber,
      nextAction: data.nextAction,
      followUpDate: data.followUpDate,
      createdBy: data.createdBy || 'admin',
      addedBy: data.addedBy || '',
    });

    await newLetter.save();

    return res.status(200).json({ success: true, message: 'Letter registered successfully' });
  } catch (error) {
    console.error('Error registering letter:', error);
    return res.status(500).json({ success: false, message: 'Error registering letter' });
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
