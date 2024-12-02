"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["SUCCESS"] = "success";
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["TITLE"] = "title";
    LogLevel["RESULT"] = "result";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(options = { showTimestamp: true }) {
        this.options = options;
    }
    formatMessage(level, message, context) {
        const timestamp = this.options.showTimestamp ? `[${new Date().toISOString()}]` : '';
        const contextStr = context ? ` ${chalk_1.default.dim(JSON.stringify(context))}` : '';
        const levelColor = this.getColorForLevel(level);
        return `${timestamp} ${levelColor(`[${level.toUpperCase()}]`)} ${message}${contextStr}`;
    }
    getColorForLevel(level) {
        switch (level) {
            case LogLevel.SUCCESS:
                return chalk_1.default.green;
            case LogLevel.ERROR:
                return chalk_1.default.red;
            case LogLevel.WARN:
                return chalk_1.default.yellow;
            case LogLevel.TITLE:
                return chalk_1.default.cyan.bold;
            case LogLevel.RESULT:
                return chalk_1.default.green.bold;
            default:
                return chalk_1.default.cyan;
        }
    }
    log(level, message, context) {
        const formatted = this.formatMessage(level, message, context);
        if (level === LogLevel.ERROR) {
            console.error(formatted);
        }
        else {
            console.log(formatted);
        }
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    success(message, context) {
        this.log(LogLevel.SUCCESS, message, context);
    }
    error(message, context) {
        this.log(LogLevel.ERROR, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    title(message) {
        this.log(LogLevel.TITLE, message);
    }
    result(message) {
        this.log(LogLevel.RESULT, message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map