import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Request() req: any) {
    const wallet = await this.walletService.getWallet(req.user.id);
    return { data: wallet, error: null, meta: {} };
  }

  @Get('transactions')
  async getTransactions(@Request() req: any, @Query() query: any) {
    const result = await this.walletService.getTransactions(req.user.id, query);
    return { data: result.data, error: null, meta: result.meta };
  }

  @Post('redeem-voucher')
  async redeemVoucher(@Request() req: any, @Body() dto: { code: string }) {
    const result = await this.walletService.redeemVoucher(req.user.id, dto.code);
    return { data: result, error: null, meta: {} };
  }
}