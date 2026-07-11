import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsMongoId,
  Min,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConcertDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'Titre requis' })
  @IsString()
  title!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'Description requise' })
  @IsString()
  description!: string;

  @IsNotEmpty({ message: 'Veuillez choisir un auteur' })
  @IsMongoId()
  band_id!: string;

  @IsNotEmpty({ message: 'Veuillez choisir un genre' })
  @IsMongoId()
  genre_id!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'Veuillez choisir une date' })
  @IsDateString()
  date!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: 'Veuillez choisir une heure' })
  @IsString()
  time!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsNotEmpty({ message: "Veuillez entrer le lieu de l'évènement" })
  @IsString()
  location!: string;

  @IsNotEmpty({ message: 'Veuillez entrer le tarif' })
  @IsNumber({})
  @Min(0)
  price!: number;

  @IsNotEmpty({ message: 'Veuillez entrer le nombre de ticket' })
  @IsNumber()
  @Min(0)
  availableTickets!: number;

  @IsNotEmpty({ message: 'Veuillez entrer le nombre total de ticket' })
  @IsNumber()
  @Min(0)
  totalTickets!: number;

  @IsOptional()
  @IsString()
  image?: string;
}
