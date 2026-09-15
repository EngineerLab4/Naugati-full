import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async signup(email: string, password: string, role: 'shipowner' | 'shipper') {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, password_hash, role });
    return this.issueTokens(user.id, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.role);
  }

  private issueTokens(sub: string, role: string) {
    // access + refresh JWT per ARCHITECTURE.md §3
    const access_token = this.jwt.sign({ sub, role });
    const refresh_token = this.jwt.sign({ sub, role, type: 'refresh' }, { expiresIn: '7d' });
    return { access_token, refresh_token };
  }
}
