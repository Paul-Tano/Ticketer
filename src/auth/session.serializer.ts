import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, user: any) => void): any {
    done(null, { _id: user._id }); // only serialize ID to save session space, but we can also leave it as user
  }
  
  async deserializeUser(
    payload: any,
    done: (err: Error | null, user: any) => void,
  ) {
    try {
      const user = await this.usersService.findOne(payload._id);
      if (!user) {
        return done(null, null);
      }
      if (user.status === 'suspended') {
        return done(null, null); // Log them out dynamically if suspended
      }
      done(null, user);
    } catch (err: any) {
      done(err, null);
    }
  }
}
