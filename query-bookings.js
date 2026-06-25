const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ticketer_db').then(async () => {
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log('Total Bookings:', bookings.length);
  if(bookings.length > 0) {
     console.log('Sample Booking user_id type:', typeof bookings[0].user_id, bookings[0].user_id);
     console.log('Sample Booking concert_id type:', typeof bookings[0].concert_id, bookings[0].concert_id);
  }
  process.exit(0);
});
