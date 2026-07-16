import { IsPhoneNumber, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ example: '+60123456789', description: 'Phone number in international format' })
  @IsString()
  @IsPhoneNumber('MY', { message: 'Please provide a valid Malaysian phone number' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+60123456789' })
  @IsString()
  @IsPhoneNumber('MY')
  phone: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsPhoneNumber('MY')
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;
}