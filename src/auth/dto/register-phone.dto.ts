import { IsString, MinLength } from 'class-validator';

export class RegisterPhoneDto {
  @IsString()
  phone: string; // очікуємо +380... (E.164)

  @IsString()
  @MinLength(6)
  password: string;
}
