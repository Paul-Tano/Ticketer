import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Genre, GenreDocument } from './schemas/genre.schemas';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private genreModel: Model<GenreDocument>,
  ) {}

  findAll() {
    return this.genreModel.find();
  }

  async create(data: { name: string }): Promise<Genre> {
    const newGenre = new this.genreModel(data);
    return newGenre.save();
  }

  async update(id: string, data: { name: string }): Promise<Genre | null> {
    return this.genreModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string): Promise<Genre | null> {
    return this.genreModel.findById(id).exec();
  }
}
