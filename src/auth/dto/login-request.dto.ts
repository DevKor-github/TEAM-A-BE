import { IsBoolean, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsBoolean()
  keepingLogin: boolean;
}
