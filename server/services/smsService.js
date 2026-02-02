/**
 * SMS Service (Mock)
 * In production, integrate with services like Twilio, AWS SNS, etc.
 */

const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS sending
    console.log(`[SMS MOCK] Sending to ${phoneNumber}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, replace with actual SMS API call:
    // const response = await twilioClient.messages.create({
    //   body: message,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });
    
    return { success: true, message: 'SMS sent successfully (mock)' };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation SMS
const sendBookingConfirmation = async (phoneNumber, bookingDetails) => {
  const message = `Your booking has been confirmed. Date: ${bookingDetails.date}, Time: ${bookingDetails.time}. Type: ${bookingDetails.consultationType}`;
  return await sendSMS(phoneNumber, message);
};

// Send booking reminder SMS
const sendBookingReminder = async (phoneNumber, bookingDetails) => {
  const message = `Reminder: You have a consultation scheduled for ${bookingDetails.date} at ${bookingDetails.time}`;
  return await sendSMS(phoneNumber, message);
};

// Send booking approval SMS
const sendBookingApproval = async (phoneNumber, bookingDetails) => {
  const message = `Your booking request has been approved. Date: ${bookingDetails.date}, Time: ${bookingDetails.time}`;
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingApproval
};
