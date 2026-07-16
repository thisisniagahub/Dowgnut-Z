import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly otpLength = 6;
  private readonly otpExpiryMinutes = 5;
  private readonly maxAttempts = 3;

  constructor(private readonly prisma: PrismaClient) {}

  async sendOtp(phone: string, isNewUser: boolean): Promise<void> {
    const normalizedPhone = this.normalizePhone(phone);
    const code = this.generateOtp();
    const codeHash = this.hashOtp(code);
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);

    // Clean up old OTPs for this phone
    await this.prisma.otpVerification.deleteMany({
      where: { phone: normalizedPhone },
    });

    // Create new OTP record
    await this.prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        codeHash: codeHash,
        expiresAt: expiresAt,
        attempts: 0,
      },
    });

    // In production, send via SMS provider (Twilio, Vonage, etc.)
    // For now, log the OTP for development
    console.log(`📱 OTP for ${phone}: ${code}`);
    
    // TODO: Integrate with SMS provider (Twilio, Vonage, etc.)
    // await this.smsProvider.send(phone, `Your DOWGNUT CLUB OTP is: ${code}`);
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);
    
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone: normalizedPhone,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return false;
    }

    if (record.attempts >= this.maxAttempts) {
      return false;
    }

    // Increment attempts
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify code
    const providedHash = this.hashOtp(code);
    const isValid = record.codeHash === providedHash;

    if (!isValid) {
      return false;
    }

    // Delete OTP after successful verification
    await this.prisma.otpVerification.delete({ where: { id: record.id } });
    return true;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private normalizePhone(phone: string): string {
    // Normalize Malaysian phone numbers
    let phone = phone.replace(/\D/g, '');
    
    // Handle Malaysian numbers
    if (phone.startsWith('60')) {
      phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
      phone = phone.substring(1);
    }
    
    // Ensure it starts with 60 for Malaysian format
    return `60${phone}`;
  }
}