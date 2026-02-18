import type { ShippingProvider, ShippingRequest, ShippingQuote, ShippingBooking } from '../../types';

/**
 * Custom error class for shipping provider failures
 * CR-07: Standardized errors for graceful fallback handling
 */
export class ShippingProviderError extends Error {
  constructor(
    message: string,
    public readonly providerId: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ShippingProviderError';
    // Ensure prototype chain is set correctly
    Object.setPrototypeOf(this, ShippingProviderError.prototype);
  }

  /**
   * Create a safe error message without exposing sensitive details
   */
  toSafeMessage(): string {
    return `Provider ${this.providerId} error: ${this.message}`;
  }
}

/**
 * Abstract base class for external delivery providers (Baemin, Coupang, Yogiyo, etc.)
 * Implements common functionality: timeout handling, retries, error standardization
 *
 * CR-07: Provider failures don't block checkout
 * CN-01: Credentials from config, never exposed in errors
 */
export abstract class ExternalProviderAdapter implements ShippingProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  readonly type: 'external' = 'external';

  protected config: Record<string, unknown> = {};
  protected timeout = 5000; // 5s default timeout
  protected maxRetries = 1; // 1 retry on network errors

  constructor(config: Record<string, unknown>) {
    this.config = config;
    // Allow timeout/retry overrides from config
    if (typeof config.timeout === 'number' && config.timeout > 0) {
      this.timeout = config.timeout;
    }
    if (typeof config.maxRetries === 'number' && config.maxRetries >= 0) {
      this.maxRetries = config.maxRetries;
    }
  }

  /**
   * Check if this provider can deliver to the given address
   */
  abstract canDeliver(request: ShippingRequest): Promise<boolean>;

  /**
   * Get shipping quotes for the request
   */
  abstract getQuotes(request: ShippingRequest): Promise<ShippingQuote[]>;

  /**
   * Book a delivery using a previously obtained quote
   * Optional - some providers may only provide quotes without booking capability
   */
  abstract book?(quoteId: string): Promise<ShippingBooking>;

  /**
   * Parse raw API response into standardized ShippingQuote
   * Each provider implements their own parsing logic
   */
  protected abstract parseQuote(rawQuote: unknown): ShippingQuote;

  /**
   * Make HTTP request with timeout and retry logic
   * Uses AbortController for timeout handling
   * Retries on network errors (not on 4xx/5xx responses)
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Don't retry on client/server errors (4xx, 5xx)
          // These are intentional responses, not network issues
          const errorBody = await response.text().catch(() => 'Unknown error');
          throw new ShippingProviderError(
            `HTTP ${response.status}: ${response.statusText}`,
            this.id,
            { status: response.status, body: errorBody }
          );
        }

        return await response.json() as T;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        // Don't retry if it's already a ShippingProviderError (HTTP error)
        if (error instanceof ShippingProviderError) {
          throw error;
        }

        // Check if it's a timeout (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new ShippingProviderError(
            `Request timeout after ${this.timeout}ms`,
            this.id,
            error
          );
          // Retry on timeout
          if (attempt < this.maxRetries) {
            continue;
          }
          throw lastError;
        }

        // Retry on other network errors
        if (attempt < this.maxRetries) {
          continue;
        }

        // Final attempt failed
        throw this.handleError(error);
      }
    }

    // Should not reach here, but handle just in case
    throw this.handleError(lastError);
  }

  /**
   * Standardize error handling
   * CR-07: Errors are caught and standardized for graceful fallback
   * CN-01: Never expose credentials in error messages
   */
  protected handleError(error: unknown): never {
    // Already a ShippingProviderError
    if (error instanceof ShippingProviderError) {
      throw error;
    }

    // Standard Error
    if (error instanceof Error) {
      throw new ShippingProviderError(
        this.sanitizeErrorMessage(error.message),
        this.id,
        error
      );
    }

    // Unknown error type
    throw new ShippingProviderError(
      'Unknown provider error',
      this.id,
      error
    );
  }

  /**
   * Remove any potential credential leaks from error messages
   * CN-01: Credentials never exposed
   */
  private sanitizeErrorMessage(message: string): string {
    // Get all credential keys to check against
    const credentialKeys = ['apiKey', 'apiSecret', 'token', 'secret', 'password', 'key'];

    let sanitized = message;

    // Remove any config values that might have leaked into the message
    for (const key of credentialKeys) {
      const value = this.config[key];
      if (typeof value === 'string' && value.length > 0) {
        // Replace credential value with [REDACTED]
        sanitized = sanitized.replace(new RegExp(this.escapeRegex(value), 'g'), '[REDACTED]');
      }
    }

    return sanitized;
  }

  /**
   * Escape special regex characters in a string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Safely get a credential from config
   * Throws descriptive error if credential is missing
   * CN-01: Credentials only accessed through this method
   */
  protected getCredential(key: string): string {
    const value = this.config[key];
    if (value === undefined || value === null) {
      throw new ShippingProviderError(
        `Missing required credential: ${key}`,
        this.id
      );
    }
    if (typeof value !== 'string') {
      throw new ShippingProviderError(
        `Invalid credential type for ${key}: expected string`,
        this.id
      );
    }
    if (value.trim() === '') {
      throw new ShippingProviderError(
        `Empty credential value for: ${key}`,
        this.id
      );
    }
    return value;
  }

  /**
   * Get optional config value with type checking
   */
  protected getConfigValue<T>(key: string, defaultValue: T): T {
    const value = this.config[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    // Type check for common types
    if (typeof defaultValue === 'string' && typeof value !== 'string') {
      return defaultValue;
    }
    if (typeof defaultValue === 'number' && typeof value !== 'number') {
      return defaultValue;
    }
    if (typeof defaultValue === 'boolean' && typeof value !== 'boolean') {
      return defaultValue;
    }
    return value as T;
  }

  /**
   * Generate a unique quote ID with provider prefix
   * DB-04: Client-generated quoteId with providerId prefix
   */
  protected generateQuoteId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${this.id}_${timestamp}_${random}`;
  }

  /**
   * Calculate quote expiration time
   * CR-06: Quotes expire (default 15 minutes)
   */
  protected getQuoteExpiration(minutesFromNow = 15): Date {
    return new Date(Date.now() + minutesFromNow * 60 * 1000);
  }
}
