import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARN = 'warn',
  TITLE = 'title',
  RESULT = 'result',
}

export interface LoggerOptions {
  showTimestamp?: boolean;
  level?: LogLevel;
}

export class Logger {
  constructor(private options: LoggerOptions = { showTimestamp: true }) {}

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): string {
    const timestamp = this.options.showTimestamp ? `[${new Date().toISOString()}]` : '';
    const contextStr = context ? ` ${chalk.dim(JSON.stringify(context))}` : '';
    const levelColor = this.getColorForLevel(level);

    return `${timestamp} ${levelColor(`[${level.toUpperCase()}]`)} ${message}${contextStr}`;
  }

  private getColorForLevel(level: LogLevel) {
    switch (level) {
      case LogLevel.SUCCESS:
        return chalk.green;
      case LogLevel.ERROR:
        return chalk.red;
      case LogLevel.WARN:
        return chalk.yellow;
      case LogLevel.TITLE:
        return chalk.cyan.bold;
      case LogLevel.RESULT:
        return chalk.green.bold;
      default:
        return chalk.cyan;
    }
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const formatted = this.formatMessage(level, message, context);
    if (level === LogLevel.ERROR) {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  success(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.SUCCESS, message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  title(message: string) {
    this.log(LogLevel.TITLE, message);
  }

  result(message: string) {
    this.log(LogLevel.RESULT, message);
  }
}
