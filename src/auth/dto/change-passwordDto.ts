import { IsString, MinLength, Matches } from 'class-validator';

// 1 велика літера, 1 цифра, 1 спецсимвол, мін. 8 символів
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'oldPassword must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'newPassword must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  newPassword: string;
}
