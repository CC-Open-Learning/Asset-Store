import {
  format as _format,
  transports as _transports,
  createLogger
} from "winston";
import winstonDaily from "winston-daily-rotate-file";
const { combine, printf, timestamp } = _format;
import dotenv from "dotenv";
dotenv.config();

// All levels that Winston supports by default
const LEVELS = {
  debug: 5,
  error: 0,
  http: 3,
  info: 2,
  silly: 6,
  verbose: 4,
  warn: 1
};

//------------ Winston logger instance ------------
const logger = createLogger({
  // Combine timestamp and message formats
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    printf(msg => `${msg.timestamp} ${msg.level}: ${msg.message}`)
  ),

  levels: LEVELS,
  // Define multiple transports for log messages
  transports: [
    new winstonDaily({
      datePattern: "YYYY-MM-DD",
      dirname: "logs/error",
      extension: ".error.log",
      filename: `%DATE%`,
      level: "error",
      maxFiles: "7d",
      zippedArchive: true
    }),
    new winstonDaily({
      datePattern: "YYYY-MM-DD",
      dirname: "logs/http",
      extension: ".http.log",
      filename: `%DATE%`,
      level: "http",
      maxFiles: "7d",
      zippedArchive: true
    }),
    // Create a console transport for "debug" logs
    new _transports.Console({
      format: _format(message => message.level === "debug" && message)(),
      level: "debug" // Logs only "debug" level
    })
  ]
});

// Displays all logs on console in dev mode
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new _transports.Console({
      format: _format.combine(
        _format.colorize(), // Color and print
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        printf(msg => `${msg.timestamp} ${msg.level}: ${msg.message}`)
      )
    })
  );
}

// Custom write stream for compatibility with other libraries - Morgan middleware
logger.stream = {
  /**
   * Write stream for Morgan middleware.
   * @param msg - Message to log.
   */
  write: msg => logger.http(msg.trim())
};

export default logger;
