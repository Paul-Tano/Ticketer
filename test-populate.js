const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/my_show_time');
  const db = mongoose.connection.db;
  const bookings = await db.collection('bookings').find({}).toArray();
  console.log("ALL BOOKINGS IN DB:", bookings.length);
  for (let b of bookings) {
      console.log("Booking ID:", b._id, "User ID:", b.user_id, "Type:", typeof b.user_id, "IsObjectId:", b.user_id instanceof mongoose.Types.ObjectId);
  }
  process.exit(0);
}
run().catch(console.error);
