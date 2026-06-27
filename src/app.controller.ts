import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConcertsService } from './concerts/concerts.service';
import { BandsService } from './bands/bands.service';
// import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LocalAuthGuard } from './auth/guards/local.auth.guard';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth/auth.service';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { User } from './users/types/usersType';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { formatConcertDate } from './utils/date.formatter';

import {
  Body,
  Delete,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { BookingsService } from './bookings/bookings.service';
import { GenresService } from './genres/genres.service';
import { AdminGuard } from './auth/guards/admin.guard';

@Controller()
export class AppController {
  constructor(
    private readonly concertsService: ConcertsService,
    private readonly bandsService: BandsService,
    private readonly genresService: GenresService,
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService,

    // private readonly GenresService: GenresService,
  ) {}

  @Get('/')
  async home(@Request() req: ExpressRequest, @Res() res: Response) {
    const urgentConcerts = await this.concertsService.findUrgent(4);
    const upcomingConcerts = await this.concertsService.findUpcoming(4);
    const allBands = await this.bandsService.findAll();
    const allGenres = await this.genresService.findAll();
    return res.render('index', {
      urgentConcerts: urgentConcerts.map((c) => ({
        ...c,
        isSoldOut: c.availableTickets === 0,
        formattedDate: formatConcertDate(c.date, c.time, false),
      })),
      upcomingConcerts: upcomingConcerts.map((c) => ({
        ...c,
        formattedDate: formatConcertDate(c.date, c.time, false),
      })),
      bands: allBands.map(b => b.toObject()),
      allBands: allBands.map(b => b.toObject()),
      Allgenres: allGenres.map(g => g.toObject()),
    });
  }

  @Get('/register')
  register(@Res() res: Response) {
    return res.render('auth/register', { currentRouteName: 'register' });
  }

  @Post('/register')
  async create(@Body() body: any, @Res() res: Response) {
    const dto = plainToInstance(CreateUserDto, body);
    const errors = await validate(dto);
    const formatedErrors = {};

    if (errors.length > 0) {
      for (const error of errors) {
        formatedErrors[error.property] = Object.values(error.constraints ?? {});
      }
      // console.log(formatedErrors);
      return res.render('auth/register', {
        errors: formatedErrors,
        currentRouteName: 'register',
      });
    }
    const confirm = dto.confirm;
    const password = dto.password;

    if (confirm !== password) {
      formatedErrors['password'] = 'paswords do not match';
      return res.render('auth/register', {
        errors: formatedErrors,
        currentRouteName: 'register',
      });
    }
    try {
      await this.usersService.create(dto);
      return res.redirect('/login');
    } catch (e) {
      formatedErrors['error'] = e.response;
      console.log(formatedErrors);
      return res.render('auth/register', {
        errors: formatedErrors,
        currentRouteName: 'register',
      });
    }
  }

  @Get('/login')
  loginView(@Res() res: Response) {
    return res.render('auth/login', { currentRouteName: 'login' });
  }

  @Post('/login')
  async login(@Request() req: ExpressRequest, @Res() res: Response, @Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      const error = 'email or password incorrect';
      return res.render('auth/login', {
        error: error,
        currentRouteName: 'login',
      });
    }

    if (user.status === 'suspended') {
      return res.render('auth/login', {
        error: 'Votre compte a été suspendu.',
        currentRouteName: 'login',
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.render('auth/login', {
          error: 'An error occurred during login',
          currentRouteName: 'login',
        });
      }
      req.session.save((saveErr) => {
        if (saveErr) console.error("Session save error:", saveErr);
        return res.redirect('/');
      });
    });
  }
  @Get('/logout')
  logout(@Request() req: ExpressRequest, @Res() res: Response) {
    req.logout((err) => {
      if (err) { console.error(err); }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.redirect('/login');
      });
    });
  }

  //display the profile
  @UseGuards(AuthenticatedGuard)
  @Get('/profile')
  async me(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as User;
    const profileData = await this.usersService.findOne(user._id);
    return res.render('profile/index', { user: profileData });
  }

  //update profile
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Patch('/profile')
  async update(@Request() req: ExpressRequest, @Body() body: any) {
    const currentUser = req.user as User;
    const dto = plainToInstance(UpdateUserDto, body);

    const errors = await validate(dto);
    const formatedErrors = {};
    if (errors.length > 0) {
      for (const error of errors) {
        formatedErrors[error.property] = Object.values(error.constraints ?? {});
      }
      console.log(formatedErrors);
    }
    await this.usersService.update(currentUser._id, dto);
    return;
  }

  //remove profile
  @UseGuards(AuthenticatedGuard)
  @Delete('/profile')
  remove(@Request() req: ExpressRequest) {
    const user = req.user as User;
    req.session.destroy(() => {});
    return this.usersService.remove(user._id);
  }

  //admin home(dashbord)
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('/admin')
  async dashbord(@Res() res: Response) {
    const admins = await this.usersService.findAdmin();
    const countUsers = await this.usersService.findAll().countDocuments();
    const countBookings = await this.bookingsService.countAll();
    const countConcerts = await this.concertsService.countAllConcert();
    const allGenres = await this.genresService.findAll();
    const countGenres = allGenres.length;
    const allBands = await this.bandsService.findAll();
    const countBands = allBands.length;
    return res.render('admin/index', {
      admins: admins.map((admin) => admin.toObject()),
      countBookings: countBookings,
      countUsers: countUsers,
      countConcerts: countConcerts,
      countGenres: countGenres,
      countBands: countBands,
      currentRouteName: 'admin',
    });
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('/admin/users')
  async adminUsers(@Res() res: Response) {
    const users = await this.usersService.findAll();
    return res.render('admin/users/index', {
      currentRouteName: 'admin',
      users: users.map((user) => user.toObject()),
    });
  }

  // Public routes for artistes (bands)
  @Get('/artistes')
  async allArtistes(@Res() res: Response) {
    const bands = await this.bandsService.findAll();
    return res.render('bands/index', {
      bands: bands.map((b) => b.toObject()),
      currentRouteName: 'artistes',
    });
  }

  @Get('/artistes/:id')
  async artisteDetail(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: ExpressRequest
  ) {
    const band = await this.bandsService.findOne(id);
    if (!band) {
      return res.redirect('/artistes');
    }
    
    let isFavorite = false;
    const user = req.user as any;
    if (user) {
      const fullUser = await this.usersService.findOne(user._id);
      isFavorite = fullUser?.favoritBands?.some((b: any) => b._id.toString() === id) || false;
    }
    
    // Find all concerts for this band
    const concerts = await this.concertsService.findByBandId(id);
    
    return res.render('bands/detail', {
      band: band.toObject(),
      concerts: concerts.map((c) => ({
        ...c,
        isSoldOut: c.availableTickets === 0,
        formattedDate: formatConcertDate(c.date, c.time, false),
      })),
      user: user,
      isFavorite,
      currentRouteName: 'artistes',
    });
  }
}
