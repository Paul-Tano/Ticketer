import {
  Controller,
  Get,
  Patch,
  Delete,
  Res,
  Request,
  UseGuards,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import { NotificationsService } from './notifications.service';
import 'express-session';
import { User } from 'src/users/types/usersType';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';

declare module 'express-session' {
  interface SessionData {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
    };
  }
}
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthenticatedGuard)
  @Get()
  async findAllForUser(@Request() req: ExpressRequest) {
    const user = req.user as User;
    const notifications = await this.notificationsService.findAllForUser(
      user._id,
    );
    return notifications;
  }

  //pourt tester la création de notif
  @Get('/test')
  async create() {
    const concertid = '69fe89313b6b66d471ff0950';
    const band_Id = '69fcfcca5b432fd239f5471e';
    return this.notificationsService.create(band_Id, concertid);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch('read')
  async allRead(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as User;

    await this.notificationsService.allRead(user._id);
    return res.redirect('/notifications');
  }

  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Delete()
  async deleteNotif(
    //recuperer l'id dans un formulaire pour plus de secur
    @Body('id') id: string,
    @Res() res: Response,
  ) {
    await this.notificationsService.deleteNotif(id);
    return res.redirect('/notifications');
  }
}
