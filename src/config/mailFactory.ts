import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const MailFactory = () => {
  let config: ConfigService;

  return MailerModule.forRootAsync({
    useFactory: () => ({
      transport: {
        host: config.getOrThrow('SMTP_HOST'),
        secure: false,
        auth: {
          user: config.getOrThrow('SMTP_USER'),
          pass: config.getOrThrow('SMTP_PASS'),
        },
      },
      defaults: {
        from: ' "No Reply" <noreply@example.com> ',
      },
      template: {
        dir: __dirname + '../mail/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  });
};
