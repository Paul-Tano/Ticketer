const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/ticketer');
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({ username: { $regex: 'a', $options: 'i' } }).toArray();
  const userIds = users.map(u => u._id);
  console.log('UserIds:', userIds);

  const concerts = await db.collection('concerts').find({ title: { $regex: 'a', $options: 'i' } }).toArray();
  const concertIds = concerts.map(c => c._id);
  console.log('ConcertIds:', concertIds);

  const query = {
    $or: [
      { user_id: { $in: userIds } },
      { concert_id: { $in: concertIds } }
    ]
  };
  
  console.log('Query:', JSON.stringify(query));

  const bookings = await db.collection('bookings').find(query).toArray();
  console.log('Bookings:', bookings.length);
  
  process.exit(0);
}
test().catch(console.error);
