import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse: any = exception.getResponse();
    let errorMessage = 'Une erreur est survenue lors de la validation.';

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join('<br>');
      } else if (typeof exceptionResponse.message === 'string') {
        errorMessage = exceptionResponse.message;
      }
    }

    // Store the error in the session
    (request.session as any).flashError = errorMessage;

    // Redirect to the referring page, or home if not available
    const referer = request.header('Referer') || '/';
    response.redirect(referer);
  }
}
