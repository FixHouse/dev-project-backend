import { IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterPhoneDto {
  @IsString()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phoneCountry?: string; // 👈 ось це поле додай
}
