import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { formatConcertDate } from '../utils/date.formatter';
import { ConcertsService } from './concerts.service';
import { GenresService } from '../genres/genres.service';
import { BandsService } from '../bands/bands.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { UpdateConcertDto } from './dto/update-concert.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryConcertsConfig } from '../config/cloudinary.config';

import { UsersService } from '../users/users.service';

@Controller()
export class ConcertsController {
  constructor(
    private readonly concertsService: ConcertsService,
    private readonly genresService: GenresService,
    private readonly bandsService: BandsService,
    private readonly usersService: UsersService,
  ) {}

  // route pour voir tous les concerts
  @Get('concerts')
  async findAll(
    @Query('genre_id') genre_id: string,
    @Query('band_id') band_id: string,
    @Query('search') search: string,
    @Query('date') date: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const concerts = await this.concertsService.findAll({
      genre_id,
      band_id,
      date,
      search,
    });
    // Cette semaine
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const thisWeekConcerts = concerts.filter(
      (c) => new Date(c.date) >= today && new Date(c.date) <= nextWeek,
    );
    const formattedConcerts = concerts.map((c) => ({
      ...c,
      formattedDate: formatConcertDate(c.date, c.time, false),
    }));

    return res.render('concerts/index', {
      concerts: formattedConcerts,
      thisWeekConcerts,
      genres: (await this.genresService.findAll()).map(g => g.toObject()),
      bands: (await this.bandsService.findAll()).map(b => b.toObject()),
      selectedGenre: genre_id,
      selectedBand: band_id,
      selectedDate: date,
      search: search,
    });
  }

  // route pour voir un concert
  @Get('concerts/:id')
  async findOne(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const concert = await this.concertsService.findOne(id);
    const isAlmostSoldOut = concert.availableTickets > 0 && concert.totalTickets > 0 && (concert.availableTickets < concert.totalTickets * 0.20);
    let parsedDate = new Date(concert.date);
    if (isNaN(parsedDate.getTime())) parsedDate = new Date(); // fallback

    const formattedConcert = {
      ...concert,
      isAlmostSoldOut,
      isSoldOut: concert.availableTickets === 0,
      formattedDate: formatConcertDate(parsedDate, concert.time, true),
    };

    let isFavorite = false;
    if (req.user) {
      const fullUser = await this.usersService.findOne(req.user._id);
      if (fullUser && fullUser.favoritBands && fullUser.favoritBands.some((b: any) => b.toString() === concert.band_id._id.toString() || b._id?.toString() === concert.band_id._id.toString())) {
        isFavorite = true;
      }
    }

    return res.render('concerts/detail', { concert: formattedConcert, isFavorite, user: req.user });
  }

  // route de l'admin pour que il puisse voir tous les concerts
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('admin/concerts')
  async adminIndex(@Res() res: Response) {
    const concerts = await this.concertsService.findAll();
    return res.render('admin/concerts/index', {
      concerts: concerts.map(c => ({
        ...c,
        isSoldOut: c.availableTickets === 0,
        formattedDate: formatConcertDate(c.date, c.time, false),
      })),
      currentRouteName: 'admin',
    });
  }
  // route pour afficher le formulaire pour creer un concert
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('admin/concerts/create')
  async createForm(@Res() res: Response) {
    const genres = await this.genresService.findAll();
    const bands = await this.bandsService.findAll();
    return res.render('admin/concerts/create', { 
      currentRouteName: 'admin',
      genres: genres.map(g => g.toObject()),
      bands: bands.map(b => b.toObject())
    });
  }

  // route pour creer un concert
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('admin/concerts')
  @UseInterceptors(FileInterceptor('image', cloudinaryConcertsConfig))
  async create(
    @Body() dto: CreateConcertDto,
    @Res() res: Response,
    @UploadedFile() file: any,
  ) {
    if (file) {
      dto.image = file.path; // Cloudinary returns the secure URL in file.path
    }
    await this.concertsService.create(dto);
    return res.redirect('/admin/concerts');
  }

  // route pour afficher le formulaire de modif
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('admin/concerts/:id/edit')
  async editForm(@Param('id') id: string, @Res() res: Response) {
    const concert = await this.concertsService.findOne(id);
    if (concert && concert.date) {
      let parsedDate = new Date(concert.date);
      if (!isNaN(parsedDate.getTime())) {
        // @ts-ignore
        concert.formattedDateInput = parsedDate.toISOString().split('T')[0];
      }
    }
    const genres = await this.genresService.findAll();
    const bands = await this.bandsService.findAll();
    return res.render('admin/concerts/edit', { 
      concert, 
      currentRouteName: 'admin', 
      genres: genres.map(g => g.toObject()), 
      bands: bands.map(b => b.toObject()) 
    });
  }

  // route pour modifier un concert
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('admin/concerts/:id/update')
  @UseInterceptors(FileInterceptor('image', cloudinaryConcertsConfig))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConcertDto,
    @Res() res: Response,
    @UploadedFile() file: any,
  ) {
    if (file) {
      dto.image = file.path; // Cloudinary returns the secure URL in file.path
    } else {
      delete dto.image;
    }
    await this.concertsService.update(id, dto);
    return res.redirect('/admin/concerts');
  }

  // route pour supprimer un concert
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('admin/concerts/delete/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.concertsService.remove(id);
    return res.redirect('/admin/concerts');
  }
}
