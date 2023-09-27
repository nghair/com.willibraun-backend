import { IsNotEmpty, IsString } from 'class-validator';

export class authDto {
  username: string;
  password: string;
}
