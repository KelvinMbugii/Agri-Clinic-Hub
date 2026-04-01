require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find any farmer
    const farmer = await User.findOne({ role: 'farmer' });
    // Find any officer
    const officer = await User.findOne({ role: 'officer' });
    
    if (!farmer || !officer) {
      console.log('Ensure you have at least one farmer and one officer in the DB.');
      process.exit(1);
    }
    
    // Create an approved upcoming online booking
    const date = new Date();
    date.setDate(date.getDate() + 1); // tomorrow
    
    await Booking.create({
      farmer: farmer._id,
      officer: officer._id,
      date: date,
      time: '10:00',
      consultationType: 'online',
      status: 'approved',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    });
    
    console.log('Successfully seeded an approved online booking with a meet link!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
