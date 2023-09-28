import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { authDto } from './dto/loginAuth.dto';
import { log } from 'console';
import { Tokens } from './types/tokens.types';
import { AuthService } from './auth.service';
import { signupAuthDto } from './dto/signupAuthDto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RtGuards } from 'src/common/guards/rt-guards';
import { AtGuards } from 'src/common/guards/at-guards';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { createAccountDto } from './dto/create-account-dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(AtGuards)
  @ApiSecurity('JWT-auth')
  register(@Req() req: Request, @Body() registerDto: createAccountDto) {
    const user = req.user;
    this.logger.log('User is Admin: ' + user['isAdmin']);
    if(user['isAdmin']!='true'){
      throw new ConflictException('User not authorized');
    }
    this.logger.log('User Registration');
    return this.authService.register(registerDto);
  }

  @Get(':token')
  isRegisterTokenValid(@Param('token') token: string): Promise<boolean>{
    return this.authService.isRegisterTokenValid(token);
  }

  @ApiCreatedResponse({ description: 'Created access and refresh token as response.', })
  @ApiBadRequestResponse({ description: 'User cannot signup. Please fix the error or try again later', })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: signupAuthDto): Promise<Tokens> {
    this.logger.log('User signup');
    return await this.authService.signup(createUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() authDto: authDto): Promise<Tokens> {
    return this.authService.signin(authDto.username, authDto.password);
  }

  @ApiSecurity('JWT-auth')
  @UseGuards(AtGuards)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signout(@Req() req: Request) {
    const user = req.user;
    return this.authService.signout(user['sub']);
  }

  @ApiSecurity('JWT-auth')
  @UseGuards(RtGuards)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request) {
    const user = req.user;
    this.logger.log(user);
    return this.authService.refresh(user['sub'], user['refreshToken']);
  }
}
