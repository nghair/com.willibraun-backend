import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { authDto } from './dto/loginAuth.dto';
import { log } from 'console';
import { Tokens } from './types/tokens.types';
import { AuthService } from './auth.service';
import { signupAuthDto } from './dto/signupAuthDto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RtGuards } from 'src/common/guards/rt-guards';
import { AtGuards } from 'src/common/guards/at-guards';

@Controller('auth')
export class AuthController {

  private logger= new Logger('AuthController');

  constructor(
    private authService: AuthService,
    ) {}

  @Post('register')
  register() {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: signupAuthDto): Promise<Tokens> {
    this.logger.log("User signup");
    return await this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  signin(@Body() authDto: authDto): Promise<Tokens> {
    return this.authService.signin(authDto.username, authDto.password);
  }

  @UseGuards(AtGuards)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signout(@Req() req: Request) {
    const user = req.user;
    return this.authService.signout(user['sub']);
  }

  @UseGuards(RtGuards)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request) {
    const user = req.user;
    this.logger.log(user);
    return this.authService.refresh(user['sub'], user['refreshToken']);
  }
}
