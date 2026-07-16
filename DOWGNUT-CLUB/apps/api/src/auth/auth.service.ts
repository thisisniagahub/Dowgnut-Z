import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';

export interface TokenPayload {
  sub: string;
  phone: string;
  roles: string[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly prisma: PrismaClient,
  ) {}

  async requestOtp(phone: string): Promise<{ message: string }> {
    const normalizedPhone = this.normalizePhone(phone);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    await this.otpService.sendOtp(normalizedPhone, !!existingUser);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: { phone: string; code: string }): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string } }> {
    const normalizedPhone = this.normalizePhone(dto.phone);
    
    const isValid = await this.otpService.verifyOtp(normalizedPhone, dto.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          phoneVerified: true,
          referralCode: this.generateReferralCode(),
        },
        include: { roles: { include: { role: true } } },
      });

      await this.initializeWallet(user.id);
    } else if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
        include: { roles: { include: { role: true } } },
      });
    }

    const tokens = await this.generateTokens(user);
    
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: await this.generateRefreshToken(user),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: this.sanitizeUser(user), tokens: { accessToken: (await this.generateTokens(user)).accessToken, refreshToken: (await this.generateTokens(user)).refreshToken } };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'change-me',
      });

      const session = await this.prisma.session.findUnique({
        where: { token: refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: { include: { role: true } } },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        profile: true,
        wallet: true,
        creatorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = user.roles?.map((ur: any) => ur.role.name) || ['CUSTOMER'];
    
    const payload: any = {
      sub: user.id,
      phone: user.phone,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(user: any): Promise<string> {
    return this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );
  }

  private async initializeWallet(userId: string): Promise<void> {
    await this.prisma.wallet.create({
      data: {
        userId,
        coinBalance: 0,
        cashBalance: 0,
        stampBalance: 0,
      },
    });

    await this.prisma.stampCard.create({
      data: { userId, stamps: 0, completed: 0 },
    });
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('60')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `60${cleaned}`;
  }

  private sanitizeUser(user: any) {
    const { roles, ...rest } = user;
    return {
      ...rest,
      roles: user.roles?.map((ur: any) => ur.role.name) || ['CUSTOMER'],
    };
  }
}