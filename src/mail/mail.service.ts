import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Account } from 'src/auth/entities/account.entity';
import { RegistrationConfirmationEvent } from 'src/auth/events/registrationConfirmationEvent';

@Injectable()
export class MailService {

    private logger = new Logger('MailService');

    constructor(private mailerService: MailerService){}

    @OnEvent('sendRegistrationConfirmation', { async: true})
    sendRegistrationConfirmation(registrationConfirmationEvent: RegistrationConfirmationEvent){
        this.logger.log('Sending Registration confirmation for :' + registrationConfirmationEvent.email);
       
        try {
            const url = `willibraun.com/auth/passwordReset?token=${registrationConfirmationEvent.token}'`;
            this.mailerService.sendMail({
                to: registrationConfirmationEvent.email,
                subject: 'Registration succefull email',
                template: './registrationConfirmation',
                context: {
                    name : registrationConfirmationEvent.name,
                    action_url: url,                
                }
            });   
        } catch (error) {
            this.logger.error('error sending mail: ' + error);
        }
    }    
    async sendUserPasswordResetRequest(toEmail: string, name: string, token: string){
        const url = `willibraun.com/auth/passwordReset?token=${token}'`;

        await this.mailerService.sendMail({
            to: toEmail,
            subject: 'Password Reset email',
            template: './passwordResetRequest',
            context: {
                name : name,
                action_url: url,                
            }
        });
    }
}
