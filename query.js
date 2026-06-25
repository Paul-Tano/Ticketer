const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ticketer_db').then(async () => {
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log('Bookings in DB:', bookings.length);
  if(bookings.length > 0) {
     console.log('Sample booking:', bookings[0]);
  }
  process.exit(0);
});
