export declare enum TestErrorCode {
    TEST_EXECUTION_FAILED = "TEST_EXECUTION_FAILED"
}
export declare class TestError extends Error {
    code: TestErrorCode;
    details?: string[] | undefined;
    constructor(code: TestErrorCode, message: string, details?: string[] | undefined);
}
//# sourceMappingURL=errors.d.ts.map