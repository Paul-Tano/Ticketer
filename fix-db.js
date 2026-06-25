const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/my_show_time');
  const db = mongoose.connection.db;

  const bookings = await db.collection('bookings').find().toArray();
  for (const b of bookings) {
    const update = {};
    if (typeof b.user_id === 'string') {
      update.user_id = new mongoose.Types.ObjectId(b.user_id);
    }
    if (typeof b.concert_id === 'string') {
      update.concert_id = new mongoose.Types.ObjectId(b.concert_id);
    }
    if (Object.keys(update).length > 0) {
      await db.collection('bookings').updateOne({ _id: b._id }, { $set: update });
    }
  }
  console.log('Fixed bookings collection!');
  process.exit(0);
}
fix().catch(console.error);
