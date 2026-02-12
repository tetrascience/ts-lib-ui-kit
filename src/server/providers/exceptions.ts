/**
 * Provider Exceptions
 *
 * TypeScript equivalents of the Python exceptions from
 * ts-lib-ui-kit-streamlit/tetrascience/data_app_providers/exceptions.py
 */

/**
 * Base class for provider errors
 */
export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }
}

/**
 * Raised when a table is missing in the database
 */
export class MissingTableError extends ProviderError {
  constructor(message: string) {
    super(message);
    this.name = "MissingTableError";
  }
}

/**
 * Raised when a query fails
 */
export class QueryError extends ProviderError {
  constructor(message: string) {
    super(message);
    this.name = "QueryError";
  }
}

/**
 * Raised when connecting to a provider fails
 */
export class ProviderConnectionError extends ProviderError {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConnectionError";
  }
}

/**
 * Raised when the provider configuration is invalid
 */
export class InvalidProviderConfigurationError extends ProviderError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProviderConfigurationError";
  }
}

