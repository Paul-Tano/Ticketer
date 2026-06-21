import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

import { IsString, IsNumber } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsString()
  user_id?: string;

  @IsString()
  concert_id?: string;

  @IsString()
  qrCode?: string;

  @IsNumber()
  ticketCount?: number;
}
