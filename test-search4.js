const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/my_show_time');
  const db = mongoose.connection.db;

  const bookings = await db.collection('bookings').find().toArray();
  console.log('Sample booking:', bookings[0]);
  
  process.exit(0);
}
test().catch(console.error);
