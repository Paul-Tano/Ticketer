import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsMiddleware implements NestMiddleware {
  constructor(private readonly notificationsService: NotificationsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // If the user is authenticated (Passport sets req.user)
    if (req.user) {
      const user = req.user as any;
      try {
        const unreadCount = await this.notificationsService.countUnread(user._id);
        res.locals.unreadNotifsCount = unreadCount;
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        res.locals.unreadNotifsCount = 0;
      }
    } else {
      res.locals.unreadNotifsCount = 0;
    }
    next();
  }
}
