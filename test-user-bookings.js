const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ role: 'user' });
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log('User id:', user ? user._id : 'none');
  console.log('Bookings total:', bookings.length);
  if (bookings.length > 0) {
    console.log('First booking user_id:', bookings[0].user_id, 'Is ObjectId:', bookings[0].user_id instanceof mongoose.Types.ObjectId);
    if (user) {
        const foundWithObject = await db.collection('bookings').find({ user_id: user._id }).toArray();
        console.log('Found with ObjectId:', foundWithObject.length);
        const foundWithString = await db.collection('bookings').find({ user_id: user._id.toString() }).toArray();
        console.log('Found with String:', foundWithString.length);
    }
  }
  process.exit(0);
}).catch(console.error);
