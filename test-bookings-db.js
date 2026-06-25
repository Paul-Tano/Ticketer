const mongoose = require('mongoose');
const dbURL = 'mongodb://localhost:27017/ticketer_db';

mongoose.connect(dbURL).then(async () => {
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log('Total bookings:', bookings.length);
  if(bookings.length > 0) {
     console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
  }
  process.exit(0);
});
