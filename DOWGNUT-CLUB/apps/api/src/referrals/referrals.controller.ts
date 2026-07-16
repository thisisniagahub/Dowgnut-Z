import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  async getMyReferral(@Request() req: any) {
    return { data: await this.referralsService.getMyReferral(req.user.id), error: null, meta: {} };
  }

  @Post('apply')
  async applyCode(@Request() req: any, @Body() dto: { code: string }) {
    return { data: await this.referralsService.applyCode(req.user.id, dto.code), error: null, meta: {} };
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return { data: await this.referralsService.getStats(req.user.id), error: null, meta: {} };
  }
}