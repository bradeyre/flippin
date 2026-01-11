/**
 * Retry utility with exponential backoff
 * Useful for handling rate limits and transient API errors
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: (error: any) => {
    // Only retry on server errors (5xx), NOT on rate limits (429)
    // Rate limits should fail fast to avoid making the problem worse
    const status = error?.status || error?.statusCode;
    return status >= 500 && status < 600;
  },
};

/**
 * Sleep for the specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelayMs;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if this error is retryable
      if (!opts.retryableErrors(error)) {
        throw error; // Don't retry non-retryable errors
      }

      // If this was the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // Log retry attempt
      console.log(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms delay. Error:`,
        error?.message || error
      );

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
