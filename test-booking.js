const mongoose = require('mongoose');
const dbURL = 'mongodb://localhost:27017/ticketer_db';

mongoose.connect(dbURL).then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ role: 'user' });
  const concert = await db.collection('concerts').findOne({});
  
  if(user && concert) {
     console.log('Found user:', user._id, 'and concert:', concert._id);
     try {
       const res = await fetch('http://localhost:3000/bookings', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         // Wait, the endpoint expects a session cookie. This won't work easily unless we login first.
       });
     } catch (err) {
       console.log(err);
     }
  } else {
     console.log('No user or concert found');
  }
  process.exit(0);
});
