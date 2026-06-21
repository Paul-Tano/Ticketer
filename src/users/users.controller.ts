import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
  Render,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request as ExpressRequest } from 'express';
import type { Response } from 'express';
import { User } from './types/usersType';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  @Render('profile/index')
  async showProfile(@Request() req: ExpressRequest) {
    const user = req.user as User;
    const fUser = await this.usersService.findOne(user._id);

    return {
      user: fUser,
      countFasvs: fUser?.favoritBands?.length || 0,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile/edit')
  @Render('profile/edit')
  async editProfile(@Request() req: ExpressRequest) {
    const user = req.user as User;
    const fUser = await this.usersService.findOne(user._id);

    return {
      user: fUser,
    };
  }

//  @Get('profile')
//   @Render('profile/index')
//   async showProfile(@Request() req: ExpressRequest) {
//     // On simule un utilisateur compatible avec ton interface pour le test
//     const mockUser = {
//       firstname: "Ézékiël",
//       lastname: "D'ivoire",
//       email: "ezekiel@myshowtime.ci",
//       favoriteBands: []
//     };
//     return { 
//       user: mockUser,
//       countFavs: 0,
//     };
//   }

  // @UseGuards(AuthenticatedGuard)
  // @Get('profile/edit')
  // @Render('profile/edit')
  // async editProfile(@Request() req: ExpressRequest) {
  //   // Simulation pour voir le design sans être bloqué par le login
  //   const mockUser = {
  //     firstname: "Ézékiël",
  //     lastname: "D'ivoire",
  //     email: "ezekiel@myshowtime.ci"
  //   };

  //   return {
  //     user: mockUser,
  //   };
  // }

  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post('profile/update')
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() body: any,
    @Res() res: Response
  ) {
    const user = req.user as User;
    await this.usersService.update(user._id, body);
    return res.redirect('/users/profile');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get()
  async findAll(@Res() res: Response) {
    const users = await this.usersService.findAll();
    console.log(users);
    return res.render('admin/users/index', {
      currentRouteName: 'admin',
      users: users.map((user) => user.toObject()),
    });
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  //users/role *for switch role*
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('/role')
  async switchRole(@Body('id') userId: string, @Res() res: Response) {
    console.log(userId);
    await this.usersService.switchRole(userId);
    return res.redirect('/users');
  }

  //users/add-to-fav *for switch role*
  @UseGuards(AuthenticatedGuard)
  @Patch('/add-to-fav')
  @UseInterceptors(NoFilesInterceptor())
  addBandToFav(@Request() req: ExpressRequest, @Body('bandId') bandId: string) {
    const user = req.user as User;
    return this.usersService.addFavoritBand(user._id, bandId);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch('/rm-in-fav')
  @UseInterceptors(NoFilesInterceptor())
  rmBandInFav(@Request() req: ExpressRequest, @Body('bandId') bandId: string) {
    const user = req.user as User;
    return this.usersService.rmFavoritBand(user._id, bandId);
  }

  //delete a specifique user
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('/delete')
  @UseInterceptors(NoFilesInterceptor())
  async remove(@Body('id') userId: string, @Res() res: Response) {
    console.log(userId);
    await this.usersService.remove(userId);
    return res.redirect('/users');
  }
}
