import EventRequest from '@/models/event-request';
import connectDb from '@/middleware/mongoose';
import twilio from 'twilio';

const handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Request ID is required.' });
  }

  // PUT: Update a Request (Status / Rejection reason / Reminder config)
  if (req.method === 'PUT') {
    try {
      const updatedData = req.body;
      
      // Fetch original request to check if status is changing
      const originalRequest = await EventRequest.findById(id);
      if (!originalRequest) {
        return res.status(404).json({ success: false, error: 'Event request not found.' });
      }

      const updatedRequest = await EventRequest.findByIdAndUpdate(id, updatedData, { new: true });

      // Trigger Twilio notification if status changed and Twilio is configured
      const statusChanged = originalRequest.status !== updatedRequest.status;
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;
      const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER; // If defined

      if (statusChanged && accountSid && authToken && from) {
        try {
          const client = twilio(accountSid, authToken);
          let messageBody = '';
          
          if (updatedRequest.status === 'Approved') {
            messageBody = `Saheb, the event request "${updatedRequest.eventName}" scheduled for ${new Date(updatedRequest.eventDate).toLocaleDateString()} has been approved.`;
          } else if (updatedRequest.status === 'Rejected') {
            messageBody = `The event request "${updatedRequest.eventName}" has been rejected. Reason: ${updatedRequest.remark || 'None provided'}`;
          }

          // If we have an admin or target phone number, send the SMS
          if (messageBody && adminPhoneNumber) {
            await client.messages.create({
              body: messageBody,
              from,
              to: adminPhoneNumber
            });
            console.log('Twilio SMS reminder notification dispatched successfully.');
          }
        } catch (twilioErr) {
          console.error('Failed to dispatch Twilio SMS notification:', twilioErr);
        }
      }

      return res.status(200).json({ success: true, request: updatedRequest });
    } catch (error) {
      console.error('Error updating event request:', error);
      return res.status(500).json({ success: false, error: 'Failed to update event request.' });
    }
  }

  // DELETE: Delete a Request
  if (req.method === 'DELETE') {
    try {
      const deletedRequest = await EventRequest.findByIdAndDelete(id);
      if (!deletedRequest) {
        return res.status(404).json({ success: false, error: 'Event request not found.' });
      }
      return res.status(200).json({ success: true, message: 'Event request deleted successfully.' });
    } catch (error) {
      console.error('Error deleting event request:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete event request.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};

export default connectDb(handler);
