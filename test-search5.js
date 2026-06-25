const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingsService = app.get('BookingsService');
  
  const result = await bookingsService.findAll(1, 10, 'a');
  console.log('Bookings found:', result.bookings.length);
  process.exit(0);
}
bootstrap();
