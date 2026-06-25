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
      user: fUser ? JSON.parse(JSON.stringify(fUser)) : null,
      countFavs: fUser?.favoritBands?.length || 0,
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile/edit')
  @Render('profile/edit')
  async editProfile(@Request() req: ExpressRequest) {
    const user = req.user as User;
    const fUser = await this.usersService.findOne(user._id);

    return {
      user: fUser ? JSON.parse(JSON.stringify(fUser)) : null,
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
    
    // If user wants to change password, verify old password
    if (body.password && body.password.trim() !== '') {
      const fUser = await this.usersService.findOne(user._id);
      if (!fUser) {
         return res.status(404).send('User not found');
      }
      const bcrypt = require('bcrypt'); // Import here or at top
      const isMatch = await bcrypt.compare(body.oldPassword || '', fUser.password);
      
      if (!isMatch) {
        return res.render('profile/edit', {
          user: fUser,
          error: "L'ancien mot de passe est incorrect"
        });
      }
    }

    await this.usersService.update(user._id, body);
    return res.redirect('/users/profile');
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Get(':id/edit')
  async editForm(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findOne(id);
    return res.render('admin/users/edit', { editUser: user, currentRouteName: 'admin' });
  }

  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post(':id/update')
  @UseInterceptors(NoFilesInterceptor())
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response
  ) {
    await this.usersService.update(id, body);
    return res.redirect('/admin/users');
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
    return res.redirect('/admin/users');
  }

  //users/status *for switch status*
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Post('/status')
  async switchStatus(@Body('id') userId: string, @Res() res: Response) {
    await this.usersService.toggleStatus(userId);
    return res.redirect('/admin/users');
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
  @Post('/delete/:id')
  @UseInterceptors(NoFilesInterceptor())
  async remove(@Param('id') userId: string, @Res() res: Response) {
    console.log(userId);
    await this.usersService.remove(userId);
    return res.redirect('/admin/users');
  }
}
