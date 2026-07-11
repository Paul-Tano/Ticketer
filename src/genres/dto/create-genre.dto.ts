import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGenreDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'Le nom du genre doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom du genre ne peut pas être vide.' })
  name!: string;
}
