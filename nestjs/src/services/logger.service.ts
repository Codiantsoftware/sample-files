import { Injectable } from "@nestjs/common";
import { transports, format } from "winston";
import { WinstonModule } from "nest-winston";
import * as path from "path";

@Injectable()
/**
 * LoggerService class for handling logging functionalities.
 */
export class LoggerService {
  private readonly logger;
  /**
   * Creates an instance of LoggerService.
   * @constructor
   * Initializes the logger with error and combined log files.
   */
  constructor() {
    const currentDate = new Date();
    const dateFormatted = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`;
    const errorLogFile = path.join(
      __dirname,
      `../../src/logs/error-${dateFormatted}.log`
    );
    const combinedLogFile = path.join(
      __dirname,
      `../../src/logs/combined-${dateFormatted}.log`
    );

    this.logger = WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: errorLogFile,
          level: "error",
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
          filename: combinedLogFile,
          format: format.combine(format.timestamp(), format.json()),
        }),
      ],
    });
  }

  /**
   * Logs an informational message.
   * @param message The message to be logged.
   * @param context (Optional) The context associated with the message.
   */
  log(message: string, context?: string) {
    this.logger.log("info", message, { context });
  }

  /**
   * Logs an error message.
   * @param message The error message to be logged.
   * @param trace The error stack trace.
   * @param context (Optional) The context associated with the error.
   */
  error(message: string, trace: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  /**
   * Logs a warning message.
   * @param message The warning message to be logged.
   * @param context (Optional) The context associated with the warning.
   */
  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }
}
