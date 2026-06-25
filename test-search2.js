const mongoose = require('mongoose');
async function test() {
  await mongoose.connect('mongodb://localhost:27017/ticketer');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find().toArray();
  console.log('All users:', users.map(u => u.username));
  const concerts = await db.collection('concerts').find().toArray();
  console.log('All concerts:', concerts.map(c => c.title));
  process.exit(0);
}
test().catch(console.error);
