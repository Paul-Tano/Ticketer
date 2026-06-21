import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Concert, ConcertDocument } from './schemas/concert.schema';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';

@Injectable()
export class ConcertsService {
  constructor(
    @InjectModel(Concert.name)
    private concertModel: Model<ConcertDocument>,
  ) {}

  // afficher tous les concerts avec les filtres
  async findAll(filters?: {
    genre_id?: string;
    band_id?: string;
    date?: string;
    search?: string;
  }): Promise<ConcertDocument[]> {
    const query: any = {};
    if (filters?.genre_id) {
      query.genre_id = filters.genre_id;
    }
    if (filters?.band_id) {
      query.band_id = filters.band_id;
    }
    if (filters?.date) {
      // filters.date is expected in 'DD-MM-YYYY' format from flatpickr
      const parts = filters.date.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-indexed in JS Date
        const year = parseInt(parts[2], 10);
        
        const startDate = new Date(year, month, day, 0, 0, 0);
        const endDate = new Date(year, month, day, 23, 59, 59, 999);
        
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }
    if (filters?.search) {
      query.title = { $regex: filters.search, $options: 'i' };
      query.description = { $regex: filters.search, $options: 'i' };
    }
    return await this.concertModel
      .find(query)
      .populate('band_id', 'name')
      .populate('genre_id', 'name')
      .lean()
      .exec();
  }

  countAllConcert() {
    return this.concertModel.countDocuments();
  }
  // Récupérer un concert par son id
  async findOne(id: string): Promise<ConcertDocument> {
    const concert = await this.concertModel
      .findById(id)
      .populate('band_id', 'name')
      .populate('genre_id', 'name')
      .lean()
      .exec();

    if (!concert) {
      throw new NotFoundException(
        `Le concert avec l'id ${id} n'a pas été trouvé`,
      );
    }
    return concert;
  }

  // Créer un concert
  async create(dto: CreateConcertDto): Promise<ConcertDocument> {
    const concert = new this.concertModel(dto);
    return concert.save();
    // on va declencher la notification ici lorsque ezechiel va finir
  }

  // Modifier un concert
  async update(id: string, dto: UpdateConcertDto): Promise<ConcertDocument> {
    const concert = await this.concertModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!concert) {
      throw new NotFoundException(
        `Le concert avec l'id ${id} n'a pas été trouvé`,
      );
    }
    return concert;
  }

  // Supprimer un concert
  async remove(id: string): Promise<ConcertDocument> {
    const concert = await this.concertModel.findByIdAndDelete(id).exec();

    if (!concert) {
      throw new NotFoundException(
        `Le concert avec l'id ${id} n'a pas été trouvé`,
      );
    }
    return concert;
  }

  // Diminuer le nbr de tickets disponible
  async decrementTickets(
    id: string,
    ticketCount: number,
    availableTickets: number,
  ): Promise<ConcertDocument> {
    if (availableTickets === 0) {
      throw new BadRequestException(
        "Ce concert n'a plus de tickets disponibles",
      );
    }
    if (availableTickets < ticketCount) {
      throw new BadRequestException(
        `Il ne reste que ${availableTickets} tickets disponibles`,
      );
    }
    const concert = await this.concertModel
      .findByIdAndUpdate(
        id,
        { $inc: { availableTickets: -ticketCount } },
        { new: true },
      )
      .exec();

    if (!concert) {
      throw new NotFoundException(
        `Le concert avec l'id ${id} n'a pas été trouvé`,
      );
    }
    return concert;
  }
}
