import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOnebyEmail(email);
    if (!user) {
      return null;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return null;
    }
    return user;
  }
}
