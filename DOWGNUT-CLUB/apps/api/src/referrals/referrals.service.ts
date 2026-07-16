import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getMyReferral(userId: string) {
    const dowgCode = await this.prisma.dowgCode.findUnique({
      where: { userId },
      include: {
        referralEvents: {
          where: { status: { in: ['ATTRIBUTED', 'REWARDED'] } },
          include: { order: { select: { id: true, orderNumber: true, total: true, createdAt: true } } },
        },
      },
    });

    if (!dowgCode) return null;

    const totalReferrals = dowgCode.referralEvents.filter(e => e.status === 'REWARDED').length;
    const totalEarnings = dowgCode.referralEvents
      .filter(e => e.status === 'REWARDED')
      .reduce((sum, e) => sum + (e.order?.total ? Number(e.order.total) * 0.1 : 0), 0);

    return {
      code: dowgCode.code,
      totalReferrals,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      recentReferrals: dowgCode.referralEvents.slice(0, 10),
    };
  }

  async applyCode(userId: string, code: string) {
    const dowgCode = await this.prisma.dowgCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { user: true },
    });

    if (!dowgCode || dowgCode.userId === this.prisma.userId) {
      throw new Error('Invalid or own referral code');
    }

    if (dowgCode.userId === userId) {
      throw new Error('Cannot use your own referral code');
    }

    // Check if user already has a referral
    const existing = await this.prisma.referralEvent.findFirst({
      where: { referredId: userId, status: { in: ['PENDING', 'ATTRIBUTED', 'REWARDED'] } },
    });

    if (existing) {
      throw new Error('You already have a referral code applied');
    }

    // Create referral event
    const referralEvent = await this.prisma.referralEvent.create({
      data: {
        codeId: dowgCode.id,
        referrerId: dowgCode.userId,
        referredId: this.prisma.userId, // This should be the current user
        status: 'PENDING',
      },
    });

    return { message: 'Referral code applied successfully', referralId: referralEvent.id };
  }

  async getStats(userId: string) {
    const dowgCode = await this.prisma.dowgCode.findUnique({
      where: { userId },
      include: {
        referralEvents: {
          where: { status: 'REWARDED' },
          include: { order: { select: { total: true } } },
        },
      },
    });

    if (!dowgCode) return { totalReferrals: 0, totalEarnings: 0, pendingReferrals: 0 };

    const rewarded = dowgCode.referralEvents.filter(e => e.status === 'REWARDED');
    const pending = dowgCode.referralEvents.filter(e => e.status === 'PENDING' || e.status === 'ATTRIBUTED');

    return {
      totalReferrals: rewarded.length,
      totalEarnings: Math.round(rewarded.reduce((sum, e) => sum + (e.order?.total ? Number(e.order.total) * 0.1 : 0), 0) * 100) / 100,
      pendingReferrals: pending.length,
    };
  }
}