const mongoose = require('mongoose');
const { Schema, model } = mongoose;

mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const BookingSchema = new Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    concert_id: { type: mongoose.Types.ObjectId, ref: 'Concert' },
    qrCode: String
  }, { collection: 'bookings' });
  const BookingModel = model('Booking', BookingSchema);

  const userId = '6a3d7b041c4c5664aa21e8c1';
  
  const bookings = await BookingModel.find({ user_id: userId }).lean();
  console.log('Bookings found with string:', bookings.length);

  const bookings2 = await BookingModel.find({ user_id: new mongoose.Types.ObjectId(userId) }).lean();
  console.log('Bookings found with ObjectId:', bookings2.length);

  process.exit(0);
});
