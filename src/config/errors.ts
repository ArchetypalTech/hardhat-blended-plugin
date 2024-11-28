export enum ErrorCode {
  NO_CONTRACTS = 'NO_CONTRACTS',
  DISCOVERY_ERROR = 'DISCOVERY_ERROR',
  INVALID_PATH = 'INVALID_PATH',
  MISSING_CARGO = 'MISSING_CARGO',
  INVALID_CARGO_TOML = 'INVALID_CARGO_TOML',
  CARGO_READ_ERROR = 'CARGO_READ_ERROR',
  INTERFACE_NOT_FOUND = 'INTERFACE_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  MERGE_ERROR = 'MERGE_ERROR',
  CARGO_NOT_FOUND = 'CARGO_NOT_FOUND',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
}
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public details?: string[],
    public code?: ErrorCode,
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}
