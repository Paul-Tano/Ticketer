import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import * as QRCode from 'qrcode';

import { Booking } from './schemas/booking.schema';
import mongoose, { Model } from 'mongoose';
import { ConcertsService } from '../concerts/concerts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel('Booking') private BookingModel: Model<Booking>,
    private readonly concertsService: ConcertsService,
    private readonly usersService: UsersService,
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
        user_id: new mongoose.Types.ObjectId(user_id),
        concert_id: new mongoose.Types.ObjectId(dto.concert_id),
        qrCode: qrCode,
      });
    }

    const savedReservations = await this.BookingModel.insertMany(booking);

    return savedReservations;
  }
  
  async countAll() {
    return this.BookingModel.countDocuments();
  }
  
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    let query: any = {};
    if (search) {
      const userIds = await this.usersService.findIdsByUsername(search);
      const concertIds = await this.concertsService.findIdsByTitle(search);
      query = {
        $or: [
          { user_id: { $in: userIds } },
          { concert_id: { $in: concertIds } }
        ]
      };
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.BookingModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(['user_id', 'concert_id']),
      this.BookingModel.countDocuments(query)
    ]);

    return {
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
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

  async remove(id: string) {
    const booking = await this.BookingModel.findById(id);
    if (!booking) {
      throw new BadRequestException('Réservation introuvable');
    }
    
    // Increment the available tickets back
    await this.concertsService.incrementTickets(booking.concert_id.toString(), 1);
    
    // Remove the booking
    return this.BookingModel.findByIdAndDelete(id);
  }
}
