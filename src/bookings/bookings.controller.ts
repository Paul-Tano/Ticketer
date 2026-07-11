import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  Res,
} from '@nestjs/common';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { Request as ExpressRequest } from 'express';
import type { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { formatConcertDate } from 'src/utils/date.formatter';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post('/bookings')
  async create(
    @Request() req: ExpressRequest,
    @Body() createBookingDto: CreateBookingDto,
    @Res() res: Response,
  ) {
    const user = req.user as any;
    const userId = user._id || user.id;
    await this.bookingsService.create(userId, createBookingDto);
    return res.redirect('/bookings');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/bookings')
  async myBookings(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as any;
    const userId = user._id || user.id;
    const userBookings = await this.bookingsService.findByUser(userId);
    
    const formattedBookings = userBookings.map((booking: any) => {
      const b = { ...booking };
      if (b.concert_id && b.concert_id.date) {
        b.concert_id.formattedDate = formatConcertDate(b.concert_id.date, b.concert_id.time, true);
      }
      return b;
    });

    return res.render('bookings/index', { bookings: formattedBookings });
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('/admin/bookings')
  async findAll(@Request() req: ExpressRequest, @Res() res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'valide'; // Default to active bookings

    const result = await this.bookingsService.findAll(page, limit, search, status);
    
    const formattedBookings = result.bookings.map((b) => {
      const plain = b.toObject() as any;
      const dateVal = plain.createdAt || plain.created_at;
      plain.formattedDate = dateVal ? new Date(dateVal).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }) : 'Inconnue';
      return plain;
    });
    
    // Create an array of pages for pagination
    const pages = Array.from({ length: result.totalPages }, (_, i) => i + 1);

    return res.render('admin/bookings/index', {
      bookings: formattedBookings,
      currentPage: result.page,
      totalPages: result.totalPages,
      pages,
      search,
      status, // Pass the status to the template
      currentRouteName: 'admin',
    });
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('/admin/bookings/:id/delete')
  async removeBooking(@Param('id') id: string, @Res() res: Response) {
    await this.bookingsService.remove(id);
    return res.redirect('/admin/bookings');
  }
  @UseGuards(AuthenticatedGuard)
  @Get('/bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
