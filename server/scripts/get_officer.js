require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function getOfficer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    let officer = await User.findOne({ role: 'officer' });
    if (!officer) {
      console.log('No officer found');
      process.exit(1);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await User.updateOne({ _id: officer._id }, { $set: { password: hashedPassword } });
    console.log(`Email: ${officer.email}`);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
getOfficer();
