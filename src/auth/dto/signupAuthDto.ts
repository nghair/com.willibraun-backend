import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signupAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsString()
  first_name: string;
  @IsNotEmpty()
  @IsString()
  last_name: string;
  @IsEmail()
  email: string;
  is_admin: boolean = false;
  is_trainer: boolean = false;
}
