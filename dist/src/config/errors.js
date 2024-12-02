"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["NO_CONTRACTS"] = "NO_CONTRACTS";
    ErrorCode["DISCOVERY_ERROR"] = "DISCOVERY_ERROR";
    ErrorCode["INVALID_PATH"] = "INVALID_PATH";
    ErrorCode["MISSING_CARGO"] = "MISSING_CARGO";
    ErrorCode["INVALID_CARGO_TOML"] = "INVALID_CARGO_TOML";
    ErrorCode["CARGO_READ_ERROR"] = "CARGO_READ_ERROR";
    ErrorCode["INTERFACE_NOT_FOUND"] = "INTERFACE_NOT_FOUND";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    ErrorCode["MERGE_ERROR"] = "MERGE_ERROR";
    ErrorCode["CARGO_NOT_FOUND"] = "CARGO_NOT_FOUND";
    ErrorCode["INVALID_CONFIGURATION"] = "INVALID_CONFIGURATION";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class ConfigurationError extends Error {
    constructor(message, details, code) {
        super(message);
        this.details = details;
        this.code = code;
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
//# sourceMappingURL=errors.js.map