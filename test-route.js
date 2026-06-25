const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module.js');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingsController = app.get('BookingsController');

  // mock res
  const res = {
    render: (view, data) => {
      console.log('Render View:', view);
      console.log('Render Data Bookings Length:', data.bookings.length);
      console.log('First Booking:', JSON.stringify(data.bookings[0], null, 2));
    }
  };

  const req = {
    user: {
      _id: '6a3d7b041c4c5664aa21e8c1',
      role: 'user'
    }
  };

  await bookingsController.myBookings(req, res);
  await app.close();
}
bootstrap();
