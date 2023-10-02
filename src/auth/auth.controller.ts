import { Body, ConflictException, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Req, UseGuards,} from '@nestjs/common';
import { authDto } from './dto/loginAuth.dto';
import { Tokens } from './types/tokens.types';
import { AuthService } from './auth.service';
import { signupAuthDto } from './dto/signupAuthDto';
import { Request } from 'express';
import { RtGuards } from 'src/common/guards/rt-guards';
import { AtGuards } from 'src/common/guards/at-guards';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { createAccountDto } from './dto/create-account-dto';
import { MailService } from 'src/mail/mail.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    ) {}

  @Get()
  test(@Req() req: Request){
    this.mailService.sendUserPasswordResetRequest('jain.mihir95@gmail.com', 'Mihir', 'r798f0uj3frio032e320i');
  }

  @Post('register-new-user')
  @UseGuards(AtGuards)
  @ApiSecurity('JWT-auth')
  registerNewUser(@Req() req: Request, @Body() registerDto: createAccountDto) {
    const user = req.user;
    this.logger.log({method: 'registerNewUser' ,message: 'Register new User', ip: req.ip, sub: user['sub'], path: req.url, userAgent: req.headers['user-agent']},);
    this.logger.log('User is Admin: ' + user['isAdmin']);
    if (user['isAdmin'] != true) {
      throw new ConflictException('User not authorized');
    }
      
    this.logger.debug({
      message: 'User Registration',
      function: 'register'
    });
    return this.authService.register(registerDto);
  }

  @Get('register/:token')
  isRegisterTokenValid(@Param('token') token: string): Promise<boolean> {
    return this.authService.isRegisterTokenValid(token);
  }

  @ApiCreatedResponse({
    description: 'Created access and refresh token as response.',
  })
  @ApiBadRequestResponse({
    description: 'User cannot signup. Please fix the error or try again later',
  })
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
