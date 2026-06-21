import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BandsService } from './bands.service';
import type { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/bands')
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get()
  @Render('admin/bands/index')
  async findAll() {
    const bands = await this.bandsService.findAll();
    console.log(bands);
    return {
      bands: bands.map((band) => band.toObject()),
      currentRouteName: 'admin'
    };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('create')
  @Render('admin/bands/create')
  showCreateForm() {
    return { currentRouteName: 'admin' };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('create')
  async create(@Body() body: { name: string }, @Res() res: Response) {
    await this.bandsService.create(body);
    return res.redirect('/admin/bands');
  }


  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('edit/:id')
  @Render('admin/bands/edit')
  async showEditForm(@Param('id') id: string) {
    const band = await this.bandsService.findOne(id);
    console.log(band);
    return { band: band?.toObject(), currentRouteName: 'admin' };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string },
    @Res() res: Response,
  ) {
    await this.bandsService.update(id, body);
    return res.redirect('/admin/bands');
  }
}
