import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Param,
  UseGuards,} from '@nestjs/common';
import { GenresService } from './genres.service';
import type { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/genres')
export class GenreController {
  constructor(private readonly genresService: GenresService) {}

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('create')
  @Render('admin/genres/create')
  showCreateForm() {
    return {};
  }


  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('create')
  async create(@Body() body: { name: string }, @Res() res: Response) {
    await this.genresService.create(body);
    return res.redirect('/admin/genres');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('edit/:id')
  @Render('admin/genres/edit')
  async showEditForm(@Param('id') id: string) {
    const genre = await this.genresService.findById(id);
    return { genre, currentRouteName: 'admin'  };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('update/:id')
  async update(
    @Param('id') id: string, 
    @Body() body: { name: string }, 
    @Res() res: Response) {
    await this.genresService.update(id, body);
    return res.redirect('/admin/genres');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get()
  @Render('admin/genres/index')
  async findAll() {
    const genres = await this.genresService.findAll();
    console.log(genres);
    return {
      genres: genres.map((genre) => genre.toObject()),
      currentRouteName: 'admin',
    };
  }

}
