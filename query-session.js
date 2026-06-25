const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/my_show_time').then(async () => {
  const db = mongoose.connection.db;
  const sessions = await db.collection('sessions').find({}).toArray();
  for (const session of sessions) {
      const sessData = JSON.parse(session.session);
      console.log('Session ID:', session._id);
      if (sessData.passport && sessData.passport.user) {
          console.log('Passport user:', sessData.passport.user);
      }
  }
  process.exit(0);
});
