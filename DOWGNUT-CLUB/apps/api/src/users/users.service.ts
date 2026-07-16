import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        profile: true,
        wallet: true,
        creatorProfile: true,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findByReferralCode(code: string) {
    const dowgCode = await this.prisma.dowgCode.findUnique({
      where: { code },
      include: { user: true },
    });
    return dowgCode?.user || null;
  }

  async create(data: { phone: string; email?: string; fullName?: string }) {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        fullName: data.fullName,
        phoneVerified: true,
        referralCode: this.generateReferralCode(),
      },
      include: { roles: { include: { role: true } } },
    });
  }

  async updateProfile(userId: string, data: { fullName?: string; email?: string; birthDate?: Date }) {
    return this.prisma.user.update({
      where: { id: data.id },
      data: { fullName: data.fullName, email: data.email, birthDate: data.birthDate },
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
}