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
import { User } from 'src/users/types/usersType';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guards/admin.guard';

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
    console.log(createBookingDto);
    const user = req.user as User;
    await this.bookingsService.create(user._id, createBookingDto);
    return res.redirect('/bookings');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/bookings')
  async myBookings(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as User;
    const userBookings = await this.bookingsService.findByUser(user._id);
    
    const formattedBookings = userBookings.map((booking: any) => {
      const b = { ...booking };
      if (b.concert_id && b.concert_id.date) {
        b.concert_id.formattedDate = new Date(b.concert_id.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        });
      }
      return b;
    });

    return res.render('bookings/index', { bookings: formattedBookings });
  }

  @UseGuards(AuthenticatedGuard)
  @UseGuards(AdminGuard)
  @Get('/admin/bookings')
  async findAll(@Request() req: ExpressRequest, @Res() res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const search = req.query.search as string || '';

    const result = await this.bookingsService.findAll(page, limit, search);
    
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
      currentRouteName: 'admin',
    });
  }

  @UseGuards(AuthenticatedGuard)
  @UseGuards(AdminGuard)
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
