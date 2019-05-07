import * as winston from 'winston';
import { Ha4usLogger } from '@ha4us/core';
export interface Logger extends winston.LoggerInstance {}

export function LogFactory($args): Ha4usLogger {
  winston.loggers.add($args.name, {
    console: {
      colorize: true,
      level: $args.loglevel,
      prettyPrint: true,
      stderrLevels: ['error', 'warn'],
      timestamp: true,
    },
  });
  return winston.loggers.get($args.name);
}
