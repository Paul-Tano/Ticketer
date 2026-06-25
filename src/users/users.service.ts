import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUser: CreateUserDto) {
    const { password, ...user } = createUser;
    const email = createUser.email;
    const expectedUser = await this.findOnebyEmail(email);
    if (expectedUser) {
      throw new HttpException('email already exists please change', 422);
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ ...user, password: hashed });
    return newUser.save();
  }

  findAll() {
    return this.userModel.find().populate('favoritBands');
  }

  findOne(id: string) {
    const user = this.userModel.findById(id);
    return user.populate('favoritBands');
  }

  async findIdsByUsername(search: string) {
    const users = await this.userModel.find({ username: { $regex: search, $options: 'i' } }).select('_id').lean();
    return users.map(u => u._id);
  }

  findOnebyEmail(email: string) {
    const user = this.userModel.findOne({ email });
    return user;
  }
  async update(id: string, updateUser: UpdateUserDto) {
    if (updateUser.password && updateUser.password.trim() !== '') {
      updateUser.password = await bcrypt.hash(updateUser.password, 10);
    } else {
      delete updateUser.password;
    }
    const updateddUser = await this.userModel.findByIdAndUpdate(id, updateUser, {
      new: true,
    }).exec();
    return updateddUser;
  }

  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id).exec();
    return `user removes with success`;
  }

  async switchRole(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role == 'user') {
      user.role = 'admin';
    } else {
      user.role = 'user';
    }
    return user?.save();
  }

  async toggleStatus(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === 'suspended') {
      user.status = 'active';
    } else {
      user.status = 'suspended';
    }
    return user.save();
  }
  findAdmin() {
    return this.userModel.find({ role: 'admin' });
  }
  async addFavoritBand(userId: string, bandId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: {
        favoritBands: bandId,
      },
    });
    return this.findOne(userId);
  }

  async rmFavoritBand(userId: string, bandId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          favoritBands: bandId,
        },
      },
      { new: true },
    );
    return user;
  }
}
