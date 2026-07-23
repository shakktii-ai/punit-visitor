import InwardLetter from '@/models/inward-letter';
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
      photoUrl = await uploadToCloudinary(data.photo, 'inward-letters');
    }

    // Auto-generate inward number starting from 1 if not provided
    let finalInwardNumber = data.inwardNumber;
    if (!finalInwardNumber || !finalInwardNumber.toString().trim()) {
      const letters = await InwardLetter.find({}).select("inwardNumber");
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
      finalInwardNumber = String(num);
    }

    const newLetter = new InwardLetter({
      photo: photoUrl,
      inwardDate: data.inwardDate,
      inwardNumber: finalInwardNumber,
      subject: data.subject,
      senderName: data.senderName,
      senderContact: data.senderContact,
      department: data.department,
      assignedPerson: data.assignedPerson,
      actionTaken: data.actionTaken,
      status: data.status || 'Pending',
      remark: data.remark || '',
      createdBy: data.createdBy || 'admin',
      addedBy: data.addedBy || '',
    });

    await newLetter.save();

    return res.status(200).json({ success: true, message: 'Inward letter registered successfully' });
  } catch (error) {
    console.error('Error registering inward letter:', error);
    return res.status(500).json({ success: false, message: 'Error registering inward letter' });
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
