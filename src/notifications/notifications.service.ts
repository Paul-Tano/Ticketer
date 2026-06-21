import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notifications.schema';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Band, BandDocument } from 'src/bands/schemas/band.schemas';
import { Concert, ConcertDocument } from 'src/concerts/schemas/concert.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Band.name)
    private bandModel: Model<BandDocument>,
    @InjectModel(Concert.name)
    private concertModel: Model<ConcertDocument>,
  ) {}

  async create(bandId: string, concertId: string) {
    const users = await this.userModel.find().exec();
    const concernedUsers = users.filter((user) => {
      return user.favoritBands.includes(new Types.ObjectId(bandId));
    });
    if (concernedUsers.length == 0) {
      return;
    }

    const band = await this.bandModel.findById(bandId);
    const concert = await this.concertModel.findById(concertId);
    const docs = users.map((user) => ({
      user_id: user._id,
      message: `Nouveau concert de ${band?.name} : ${concert?.title}`,
      read: false,
    }));
    await this.notificationModel.insertMany(docs);
  }

  async findAllForUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
  async allRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { user_id: userId, read: false },
      { $set: { read: true } },
    );
  }
  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      user_id: userId,
      read: false,
    });
  }

  async deleteNotif(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
  }
}
