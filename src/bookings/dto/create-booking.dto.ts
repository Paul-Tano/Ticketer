import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsString, Min, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @Optional()
  user_id!: string;

  @IsNotEmpty()
  @IsString()
  concert_id!: string;

  @Optional()
  qrCode!: string;

  @IsNotEmpty()
  ticketCount!: any;
}
