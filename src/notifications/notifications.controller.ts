import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Request,
  UseGuards,
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
  async findAllForUser(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as User;
    const notifications = await this.notificationsService.findAllForUser(user._id);
    return res.render('notifications/index', {
      notifications: notifications.map(n => n.toObject()),
      currentRouteName: 'notifications'
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Post('read-all')
  async allRead(@Request() req: ExpressRequest, @Res() res: Response) {
    const user = req.user as User;
    await this.notificationsService.allRead(user._id);
    return res.redirect('/notifications');
  }

  @UseGuards(AuthenticatedGuard)
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Res() res: Response) {
    await this.notificationsService.markAsRead(id);
    return res.redirect('/notifications');
  }

  @UseGuards(AuthenticatedGuard)
  @Post('delete/:id')
  async deleteNotif(@Param('id') id: string, @Res() res: Response) {
    await this.notificationsService.deleteNotif(id);
    return res.redirect('/notifications');
  }
}
