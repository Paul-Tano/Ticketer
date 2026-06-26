import { ExceptionFilter, Catch, ArgumentsHost, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (!request.isAuthenticated || !request.isAuthenticated()) {
      return response.redirect('/login');
    }

    if (request.accepts('html')) {
      response.status(403).render('errors/403', { 
        currentRouteName: 'error'
      });
    } else {
      response.status(403).json(exception.getResponse());
    }
  }
}
