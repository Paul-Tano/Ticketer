import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import * as QRCode from 'qrcode';

import { Booking } from './schemas/booking.schema';
import { Model } from 'mongoose';
import { ConcertsService } from '../concerts/concerts.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel('Booking') private BookingModel: Model<Booking>,
    private readonly concertsService: ConcertsService,
  ) {}

  async create(user_id: string, dto: CreateBookingDto) {
    const concert = await this.concertsService.findOne(dto.concert_id);
    const count = Number(dto.ticketCount);
    
    if (concert.availableTickets < count) {
      throw new BadRequestException(`Il ne reste que ${concert.availableTickets} billets disponibles.`);
    }

    // Décrémenter les tickets
    await this.concertsService.decrementTickets(dto.concert_id, count, concert.availableTickets);

    const booking: object[] = [];

    for (let i = 0; i < count; i++) {
      const qrCode = await QRCode.toDataURL(
        `${user_id}-${dto.concert_id}-${i}-${Date.now()}`,
      );
      booking.push({
        user_id: user_id,
        concert_id: dto.concert_id,
        qrCode: qrCode,
      });
    }

    const savedReservations = await this.BookingModel.insertMany(booking);

    return savedReservations;
  }
  
  findAll() {
    return this.BookingModel.find().populate(['user_id', 'concert_id']);
  }

  async findByUser(user_id: string) {
    return this.BookingModel.find({ user_id })
      .populate({
        path: 'concert_id',
        populate: { path: 'band_id' }
      })
      .lean();
  }

  async findOne(id: string) {
    const reservation = await this.BookingModel.findById(id)
      .populate('concert_id')
      .populate('user_id');

    const tickets = await this.BookingModel.find({ reservationId: id });
    return { reservation, tickets };
  }
}
