import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  create(data: Partial<User>) {
    return this.model.create(data);
  }
}
