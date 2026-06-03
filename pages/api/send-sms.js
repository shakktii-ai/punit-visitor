// pages/api/send-sms.js

import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, message } = req.body;

    // Check if 'to' and 'message' are present in the request
    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Missing phone number or message' });
    }

    // Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    const client = twilio(accountSid, authToken);

    try {
      // Send SMS using Twilio
      const messageSent = await client.messages.create({
        body: message,
        from, // Your Twilio phone number
        to, // The phone number you're sending to
      });

      return res.status(200).json({ success: true, message: messageSent });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Failed to send SMS' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
