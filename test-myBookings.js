const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const user of users) {
      console.log('User:', user.email, 'ID:', user._id);
      const bookings = await db.collection('bookings').find({ user_id: user._id }).toArray();
      console.log('Bookings with exact ObjectId:', bookings.length);
      const bookingsStr = await db.collection('bookings').find({ user_id: user._id.toString() }).toArray();
      console.log('Bookings with string ID:', bookingsStr.length);
  }
  process.exit(0);
});
