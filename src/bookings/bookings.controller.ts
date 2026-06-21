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
  async findAll(@Res() res: Response) {
    const bookings = await this.bookingsService.findAll();
    bookings.map((booking) => {
      booking.created_at?.toLocaleDateString();
    });
    console.log(bookings);
    return res.render('admin/bookings/index', {
      bookings: bookings.map((booking) => booking.toObject()),
      currentRouteName: 'login',
    });
  }
  @UseGuards(AuthenticatedGuard)
  @Get('/bookings/:id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
