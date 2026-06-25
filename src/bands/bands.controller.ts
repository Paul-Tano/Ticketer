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
import { diskStorage } from 'multer';
import { extname } from 'path';

const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads/bands',
    filename: (req: any, file: any, callback: any) => {
      const name = req.body.name || 'band';
      const cleanName = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const fileband = `${cleanName}-${Date.now()}${extname(file.originalname)}`;
      callback(null, fileband);
    },
  }),
};

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
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() body: { name: string; description?: string; image?: string },
    @Res() res: Response,
    @UploadedFile() file: any,
  ) {
    if (file) {
      body.image = `/uploads/bands/${file.filename}`;
    }
    await this.bandsService.create(body);
    return res.redirect('/admin/bands');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get('edit/:id')
  @Render('admin/bands/edit')
  async showEditForm(@Param('id') id: string) {
    const band = await this.bandsService.findOne(id);
    return { band: band?.toObject(), currentRouteName: 'admin' };
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('update/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; description?: string; image?: string },
    @Res() res: Response,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      body.image = `/uploads/bands/${file.filename}`;
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
