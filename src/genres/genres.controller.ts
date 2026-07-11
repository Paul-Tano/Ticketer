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
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

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
  async create(@Body() body: CreateGenreDto, @Res() res: Response) {
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
    @Body() body: UpdateGenreDto, 
    @Res() res: Response) {
    await this.genresService.update(id, body as any);
    return res.redirect('/admin/genres');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get()
  @Render('admin/genres/index')
  async findAll() {
    const genres = await this.genresService.findAll();
    return {
      genres: genres.map((genre) => genre.toObject()),
      currentRouteName: 'admin',
    };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.genresService.remove(id);
    return res.redirect('/admin/genres');
  }
}
