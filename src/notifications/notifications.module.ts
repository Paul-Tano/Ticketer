import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notifications.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { Band, BandSchema } from 'src/bands/schemas/band.schemas';
import { Concert, ConcertSchema } from 'src/concerts/schemas/concert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Band.name, schema: BandSchema },
      { name: Concert.name, schema: ConcertSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
