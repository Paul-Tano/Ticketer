const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const bookingsRaw = await db.collection('bookings').find({}).toArray();
  const userId = bookingsRaw[0].user_id.toString();
  
  const BookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    concert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }
  });
  const Booking = mongoose.model('Booking', BookingSchema);
  
  const bookings = await Booking.find({ user_id: userId }).lean().exec();
  console.log('Mongoose Bookings found:', bookings.length);
  process.exit(0);
});
