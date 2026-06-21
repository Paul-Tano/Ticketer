import { PartialType } from '@nestjs/mapped-types';
import { CreateConcertDto } from './create-concert.dto';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsMongoId,
  Min,
} from 'class-validator';

export class UpdateConcertDto extends PartialType(CreateConcertDto) {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsMongoId()
  band_id?: string;

  @IsMongoId()
  genre_id?: string;

  @IsDateString()
  date?: string;

  @IsString()
  location?: string;

  @IsNumber()
  @Min(0)
  price?: number;

  @IsNumber()
  @Min(0)
  availableTickets?: number;

  @IsString()
  image?: string;
}
