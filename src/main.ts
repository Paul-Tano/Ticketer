import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { engine } from 'express-handlebars';
import * as Handlebars from 'handlebars';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  Handlebars.registerHelper('eq', function (a, b) {
    return a?.toString() === b?.toString();
  });
  Handlebars.registerHelper('isNot', (a, b) => a !== b);
  Handlebars.registerHelper('or', (a, b) => a || b);
  Handlebars.registerHelper('and', (a, b) => a && b);
  Handlebars.registerHelper('and', function (...args) {
    args.pop(); // retire options
    return args.every(Boolean);
  });
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(__dirname, '..', 'views/layouts'),
    }),
  );

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');
  app.useGlobalPipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }));
  const MongoStore = require('connect-mongo').default;
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/ticketer',
        collectionName: 'sessions'
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware to make the authenticated user available to all Handlebars templates globally
  // We stringify and parse to convert Mongoose document to plain object, bypassing Handlebars security limits
  app.use((req, res, next) => {
    if (req.user) {
      res.locals.user = JSON.parse(JSON.stringify(req.user));
    } else {
      res.locals.user = null;
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
