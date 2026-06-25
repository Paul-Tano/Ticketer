const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const BookingSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    concert_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert' },
    qrCode: String
  }, { collection: 'bookings' });
  
  const ConcertSchema = new Schema({ title: String }, { collection: 'concerts' });
  
  const BookingModel = mongoose.model('Booking', BookingSchema);
  mongoose.model('Concert', ConcertSchema);

  const bookings = await BookingModel.find({ user_id: '6a3d7b041c4c5664aa21e8c1' }).populate('concert_id').lean();
  console.log('Bookings array length:', bookings.length);
  if(bookings.length > 0) {
    console.log('First booking title:', bookings[0].concert_id ? bookings[0].concert_id.title : 'No concert');
  }
  process.exit(0);
}).catch(console.error);
