import EventRequest from '@/models/event-request';
import connectDb from '@/middleware/mongoose';
import { uploadToCloudinary } from '@/lib/cloudinary';

const handler = async (req, res) => {
  const requestUsername = req.headers["x-username"] || req.query.username || "";
  const RESTRICTED_ADMINS = ["MKulkarni", "Deshmukh"];

  // GET: Fetch event requests
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      
      if (RESTRICTED_ADMINS.includes(requestUsername) && !username) {
        return res.status(403).json({ success: false, error: 'Access denied to Calendar and Event Requests.' });
      }

      let query = {};
      if (username) {
        query.username = username;
      }
      
      const requests = await EventRequest.find(query).sort({ eventDate: 1, eventTime: 1 });
      return res.status(200).json({ success: true, requests });
    } catch (error) {
      console.error('Error fetching event requests:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch event requests.' });
    }
  }

  // POST: Create a new event request
  if (req.method === 'POST') {
    try {
      const {
        eventName,
        eventDate,
        eventTime,
        eventOrganizer,
        eventLocation,
        description,
        contactDetails,
        username,
        image,
      } = req.body;

      if (!eventName || !eventDate || !eventTime || !eventOrganizer || !eventLocation || !description || !username) {
        return res.status(400).json({ success: false, error: 'All fields (except contact details) are required.' });
      }

      const imageUrl = image ? await uploadToCloudinary(image, 'events/invitations') : '';

      const newRequest = new EventRequest({
        eventName,
        eventDate: new Date(eventDate),
        eventTime,
        eventOrganizer,
        eventLocation,
        description,
        contactDetails: contactDetails || '',
        username,
        image: imageUrl || '',
        status: 'Pending',
        remark: '',
        reminderConfig: {
          oneDayBefore: false,
          twoHoursBefore: false,
          customTime: null,
        },
      });

      await newRequest.save();
      return res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
      console.error('Error creating event request:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit invitation request.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

export default connectDb(handler);
