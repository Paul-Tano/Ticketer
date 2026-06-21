import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Response } from 'express';
import { User } from 'src/users/types/usersType';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const user = request.user as User;

    if (user && user.role == 'admin') {
      return true;
    }

    // res.redirect('/login');
    return false;
  }
}
