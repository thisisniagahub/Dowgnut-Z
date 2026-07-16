import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaClient) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId, coinBalance: 0, cashBalance: 0, stampBalance: 0 } });
    }
    return wallet;
  }

  async getTransactions(userId: string, query: any) {
    const { page = 1, limit = 20, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { wallet: { userId } };
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: 20,
      }),
      this.prisma.walletTransaction.count({ where: { wallet: { userId } } }),
    ]);

    return { data: transactions, meta: { page, limit: 20, total, totalPages: Math.ceil(total / 20) } };
  }

  async redeemVoucher(userId: string, code: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { code } });
    if (!voucher || !voucher.isActive) throw new Error('Invalid voucher');

    const userVoucher = await this.prisma.userVoucher.findUnique({
      where: { userId_voucherId: { userId, voucherId: voucher.id } },
    });
    if (userVoucher?.redeemed) throw new Error('Voucher already redeemed');

    // Logic to apply voucher based on type
    return { success: true, message: 'Voucher redeemed successfully' };
  }

  async addCoins(userId: string, amount: number, sourceType: string, sourceId: string, idempotencyKey: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await this.ensureWallet(tx, userId);
      const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const newBalance = wallet.coinBalance + amount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { coinBalance: newBalance } });

      return tx.walletTransaction.create({
        data: { walletId: wallet.id, type: 'COIN_EARN', amount, balanceAfter: newBalance, sourceType, sourceId, idempotencyKey },
      });
    });
  }

  private async ensureWallet(tx: any, userId: string) {
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { userId: wallet.userId, coinBalance: 0, cashBalance: 0, stampBalance: 0 } });
    }
    return wallet;
  }
}