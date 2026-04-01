require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // find a booking that has a year > 3000
    const col = mongoose.connection.collection('bookings');
    await col.updateMany(
      { date: { $gt: new Date('3000-01-01T00:00:00Z') } },
      { $set: { date: new Date('2026-03-27T10:00:00Z') } }
    );
    console.log('Fixed bad dates!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
fix();
