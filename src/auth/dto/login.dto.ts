import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // email або телефон

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
