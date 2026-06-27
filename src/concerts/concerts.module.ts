import { Module } from '@nestjs/common';
import { GenreModule } from 'src/genres/genres.module';
import { BandsModule } from 'src/bands/bands.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConcertsController } from './concerts.controller';
import { Concert, ConcertSchema } from './schemas/concert.schema';
import { ConcertsService } from './concerts.service';
import { BandsService } from 'src/bands/bands.service';
import { GenresService } from 'src/genres/genres.service';

import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    GenreModule,
    BandsModule,
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([{ name: Concert.name, schema: ConcertSchema }]),
  ],
  controllers: [ConcertsController],
  providers: [ConcertsService, BandsService, GenresService],
  exports: [ConcertsService], // permet aux autres modules d'utiliser ce service
})
export class ConcertsModule {}
