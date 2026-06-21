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

import {
  Body,
  Delete,
  Patch,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
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
    console.log("req.session ID: ", req.sessionID);
    console.log("req.user in home: ", req.user ? 'exists' : 'undefined');
    const urgentConcerts = await this.concertsService.findAll();
    const upcomingConcerts = await this.concertsService.findAll();
    // const allBands = await this.BandsService.findAll();
    //const allGenres = await this.GenresService.findAll();
    return res.render('index', {
      urgentConcerts: urgentConcerts.slice(0, 3).map((c) => ({
        ...c,
        isSoldOut: c.availableTickets === 0,
      })),
      upcomingConcerts: upcomingConcerts.map((c) => ({
        ...c,
        formattedDate: new Date(c.date).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
      })),
      // allBands: allBands,
      // allGenres: allGenres,
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
  @UseGuards(AuthenticatedGuard)
  @UseGuards(AdminGuard)
  @Get('/admin')
  async dashbord(@Res() res: Response) {
    const admins = await this.usersService.findAdmin();
    const countUsers = await this.usersService.findAll().countDocuments();
    const countBookings = await this.bookingsService.findAll().countDocuments();
    const countConcerts = await this.concertsService.countAllConcert();
    // const countGenres = await this.genresService.findAll().countDocuments();
    // const countBands = await this.bandsService.findAll().countDocuments();
    console.log(admins);
    return res.render('admin/index', {
      admins: admins.map((admin) => admin.toObject()),
      countBookings: countBookings,
      countUsers: countUsers,
      countConcerts: countConcerts,
      currentRouteName: 'admin',
    });
  }
}
