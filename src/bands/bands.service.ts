import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Band, BandDocument } from './schemas/band.schemas';

@Injectable()
export class BandsService {
  constructor(@InjectModel(Band.name) private bandModel: Model<BandDocument>) {}

  async findAll() {
    return this.bandModel.find();
  }

  async create(data: { name: string }): Promise<Band> {
    const newBand = new this.bandModel(data);
    return newBand.save();
  }

  async findOne(id: string) {
    return this.bandModel.findById(id);
  }

  async update(id: string, data: { name: string }): Promise<Band | null> {
    return this.bandModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.bandModel.findByIdAndDelete(id).exec();
  }
}
