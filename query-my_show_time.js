const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log('Total Bookings:', bookings.length);
  if(bookings.length > 0) {
     console.log('Sample Booking user_id type:', typeof bookings[0].user_id, bookings[0].user_id);
     console.log('Sample Booking concert_id type:', typeof bookings[0].concert_id, bookings[0].concert_id);
     
     const users = await db.collection('users').find({}).toArray();
     console.log('Users in DB:', users.length);
     if (users.length > 0) {
       console.log('First user ID type:', typeof users[0]._id, users[0]._id);
     }
  }
  process.exit(0);
});
