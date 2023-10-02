import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Tokens } from './types/tokens.types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bycrypt from 'bcrypt';
import { signupAuthDto } from './dto/signupAuthDto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { createAccountDto } from './dto/create-account-dto';
import { v4 as uuid } from 'uuid';
import { MailService } from 'src/mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegistrationConfirmationEvent } from './events/registrationConfirmationEvent';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private entityManager: EntityManager,
    private jqtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private eventEmitter: EventEmitter2,
  ) {}

  async signup(createUserDto: signupAuthDto): Promise<Tokens> {
    const isRegisterTokenValid = await this.isRegisterTokenValid(
      createUserDto.registerToken,
    );
    this.logger.log(createUserDto.registerToken);
    if (!isRegisterTokenValid) {
      throw new ConflictException('Registration token is invalid.');
    }

    const hash = await this.hashData(createUserDto.password);
    createUserDto.password = hash;
    const user = new User(createUserDto);
    try {
      this.logger.log('create new user');
      const user_created = await this.entityManager.save(user);

      //delete register token
      await this.removeRegisterToken(createUserDto.registerToken);

      this.logger.log('New User Created. GetTokens');
      const tokens = await this.getTokens(
        user_created.id,
        user_created.email,
        user_created.is_admin,
        user_created.is_trainer,
      );
      this.logger.log('Tokens created. Update RT in database');
      await this.updateRtHash(user_created.id, tokens.refresh_token);
      this.logger.log('RT updated. Return tokens');
      return tokens;
    } catch (error) {
      if (error.errno == 1062) {
        this.logger.error('Duplicate entry for username or email.', error);
        //Duplicate username or email
        throw new ConflictException('Username or email already exists.');
      } else {
        this.logger.error('Unexpected error : ', error);
        throw new InternalServerErrorException();
      }
    }
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async findOneUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  /*
      async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.usersRepository.findOneBy({ id });
        user.email = updateUserDto.email;
    
        user.first_name = updateUserDto.first_name;
        user.last_name = updateUserDto.last_name;
        user.is_active = updateUserDto.is_active;
        user.is_admin = updateUserDto.is_admin;
        user.is_trainer = updateUserDto.is_trainer;
        //Agreements
        user.agb_agreement = updateUserDto.agb_agreement;
        user.newsletter_agreement = updateUserDto.newsletter_agreement;
        user.waitinglist_email_agreement =
          updateUserDto.waitinglist_email_agreement;
      }
      */

  async signin(username: string, password: string): Promise<Tokens> {
    this.logger.log('sigining in user');
    const user = await this.findOne(username);
    //this.usersRepository.findOne({
    //where: { username },
    //});
    if (!user) {
      this.logger.log('User not found', username);
      throw new ForbiddenException('Access Denied');
    }

    if (!(await bycrypt.compare(password, user.password))) {
      this.logger.log('Password incorrect');
      throw new ForbiddenException('Access Denied');
    }

    this.logger.log('User Authorized. GetTokens');
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.is_admin,
      user.is_trainer,
    );
    this.logger.log('Tokens created. Update RT in database');
    await this.updateRtHash(user.id, tokens.refresh_token);
    this.logger.log('RT updated. Return tokens');
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    this.logger.log('refreshing token');
    const user = await this.usersRepository.findOneBy({ id: In([userId]) });

    if (!user) {
      this.logger.log('User not found');
      throw new ForbiddenException('Access Denied');
    }
    this.logger.log(user.hashedRt);
    this.logger.log(refreshToken);
    const rtMatches = refreshToken == user.hashedRt; //bycrypt.compareSync(refreshToken, user.hashedRt);
    this.logger.log(rtMatches);
    if (!rtMatches) {
      this.logger.log('Incorrect refresh token');
      throw new ForbiddenException('Access Denied');
    }

    this.logger.log('User Authorized. GetTokens');
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.is_admin,
      user.is_trainer,
    );
    this.logger.log('Tokens created. Update RT in database');
    await this.updateRtHash(user.id, tokens.refresh_token);
    this.logger.log('RT updated. Return tokens');
    return tokens;
  }

  async signout(userId: string) {
    this.logger.log('signing out user' + userId);
    const x = await this.usersRepository.update(
      { id: In([userId]), hashedRt: Not(IsNull()) },
      { hashedRt: null },
    );
    this.logger.log(x);
  }

  async register(createAccountDto: createAccountDto) {
    const account = new Account(createAccountDto);
    //account.hashedToken = uuid();
    //this.logger.log('Random token: ' + account.hashedToken);
    account.expiryDate = new Date(Date.now() + 7 * 86400000);
    this.logger.log('Random token: ' + account.expiryDate);
    try {
      this.logger.log('Register new account');
      await this.entityManager.save(account);
      //this.mailService.sendRegistrationConfirmation(account.email, account.first_name, account.id);
      this.eventEmitter.emit(
        'sendRegistrationConfirmation',
        new RegistrationConfirmationEvent(
          account.id,
          account.email,
          account.first_name,
        ),
      );
      this.logger.log('New account registered.');
    } catch (error) {
      if (error.errno == 1062) {
        this.logger.error('Account already registered with the email.', error);
        //Duplicate email
        throw new ConflictException(
          'Account with the given email already exists.',
        );
      } else {
        this.logger.error('Unexpected error : ', error);
        throw new InternalServerErrorException();
      }
    }
  }

  async isRegisterTokenValid(token: string): Promise<boolean> {
    const account = await this.accountRepository.findOneBy({ id: token });
    if (account == null) {
      this.logger.log('token not valid');
      return false;
    }
    if (account.expiryDate < new Date(Date.now())) {
      this.logger.log('token expired');
      return false;
    }

    return true;
  }

  async removeRegisterToken(token: string): Promise<boolean> {
    this.logger.log('Remove used token');
    const anyva = await this.accountRepository.delete({ id: token });
    this.logger.log(anyva);
    return true;
  }

  async getTokens(
    userId: string,
    email: string,
    isAdmin: boolean,
    isTrainer: boolean,
  ): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      //AT
      this.jqtService.signAsync(
        {
          sub: userId,
          email,
          isAdmin,
          isTrainer,
        },
        {
          secret: this.configService.getOrThrow('AT_SECRET'),
          expiresIn: 60 * 15,
        },
      ),
      //RT
      this.jqtService.signAsync(
        {
          sub: userId,
          email,
          isAdmin,
          isTrainer,
        },
        {
          secret: this.configService.getOrThrow('RT_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: string, rt: string) {
    await this.usersRepository.update({ id: In([userId]) }, { hashedRt: rt });
  }

  hashData(data: string) {
    return bycrypt.hash(data, 10);
  }
}
