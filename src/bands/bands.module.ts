import { Module } from '@nestjs/common';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Band, BandSchema } from './schemas/band.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Band.name, schema: BandSchema }]),
  ],
  controllers: [BandsController],
  providers: [BandsService],
  exports: [BandsService, MongooseModule],
})
export class BandsModule {}
