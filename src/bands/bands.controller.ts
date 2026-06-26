import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BandsService } from './bands.service';
import type { Response } from 'express';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryBandsConfig } from '../config/cloudinary.config';

@Controller('admin/bands')
export class BandsController {
  constructor(private readonly bandsService: BandsService) {}

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get()
  @Render('admin/bands/index')
  async findAll() {
    const bands = await this.bandsService.findAll();
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
  @UseInterceptors(FileInterceptor('image', cloudinaryBandsConfig))
  async create(
    @Body() body: { name: string; description?: string; image?: string },
    @Res() res: Response,
    @UploadedFile() file: any,
  ) {
    if (file) {
      body.image = file.path; // Cloudinary returns the secure URL
    }
    await this.bandsService.create(body);
    return res.redirect('/admin/bands');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('edit/:id')
  @Render('admin/bands/edit')
  async showEditForm(@Param('id') id: string) {
    const band = await this.bandsService.findOne(id);
    return { band: band?.toJSON(), currentRouteName: 'admin' };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('update/:id')
  @UseInterceptors(FileInterceptor('image', cloudinaryBandsConfig))
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; description?: string; image?: string },
    @Res() res: Response,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      body.image = file.path; // Cloudinary returns the secure URL
    } else {
      delete body.image;
    }
    await this.bandsService.update(id, body);
    return res.redirect('/admin/bands');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('delete/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.bandsService.remove(id);
    return res.redirect('/admin/bands');
  }
}
