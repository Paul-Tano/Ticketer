const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const concert = await db.collection('concerts').findOne({ _id: new mongoose.Types.ObjectId('69fbffc017ce7aec1e17e165') });
  console.log('Concert exists:', !!concert);
  process.exit(0);
});
