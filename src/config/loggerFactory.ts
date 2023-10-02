import { transports, format } from 'winston';
import 'winston-daily-rotate-file';

import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';

export const LoggerFactory = (appName: string) => {
  let consoleFormat;

  const myFormat = format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

  const DEBUG = process.env.DEBUG;
  const USE_JSON_LOGGER = process.env.USE_JSON_LOGGER;

  if (USE_JSON_LOGGER === 'true') {
    consoleFormat = format.combine(
      format.ms(),
      format.timestamp(),
      format.json(),
    );
  } else {
    consoleFormat = format.combine(
      format.colorize(),
      format.timestamp(),
      format.ms(),
      nestWinstonModuleUtilities.format.nestLike(appName, {
        colors: true,
        prettyPrint: true,
      }),
      //myFormat,
    );
  }

  return WinstonModule.createLogger({
    level: 'debug',//DEBUG ? 'debug' : 'info',
    //transports: [new transports.Console({ format: consoleFormat })],
    transports: [
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%-willibraun.log',
        //level: 'info',
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '30d',
      }),

      new transports.Console({
        format: consoleFormat,
      }),
    ],
  });
};
