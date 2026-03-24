require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('../models/User'); // ensure User model is loaded for populate

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const bs = await Booking.find({}).populate('farmer');
    console.log(bs.map(b => ({name: b.farmer?.name, date: b.date, time: b.time})));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
