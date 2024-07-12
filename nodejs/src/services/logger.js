import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const datePattern = 'YYYY-MM-DD';

function dailyLogger(object) {
  const { level } = object;
  const name = object;
  // eslint-disable-next-line new-cap
  return new winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        name,
        filename: path.join(__dirname, '../', 'logs/%DATE%', `${name}.log`),
        datePattern,
        level: level || 'info',
      }),
    ],
  });
}

export default { dailyLogger };
