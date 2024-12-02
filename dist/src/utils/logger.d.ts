export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    SUCCESS = "success",
    ERROR = "error",
    WARN = "warn",
    TITLE = "title",
    RESULT = "result"
}
export interface LoggerOptions {
    showTimestamp?: boolean;
    level?: LogLevel;
}
export declare class Logger {
    private options;
    constructor(options?: LoggerOptions);
    private formatMessage;
    private getColorForLevel;
    log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    success(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    title(message: string): void;
    result(message: string): void;
}
//# sourceMappingURL=logger.d.ts.map