"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestError = exports.TestErrorCode = void 0;
var TestErrorCode;
(function (TestErrorCode) {
    TestErrorCode["TEST_EXECUTION_FAILED"] = "TEST_EXECUTION_FAILED";
})(TestErrorCode || (exports.TestErrorCode = TestErrorCode = {}));
class TestError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'TestError';
    }
}
exports.TestError = TestError;
//# sourceMappingURL=errors.js.map