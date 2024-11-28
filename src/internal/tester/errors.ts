export enum TestErrorCode {
  TEST_EXECUTION_FAILED = 'TEST_EXECUTION_FAILED',
}

export class TestError extends Error {
  constructor(
    public code: TestErrorCode,
    message: string,
    public details?: string[],
  ) {
    super(message);
    this.name = 'TestError';
  }
}
