/**
 * Logger Utility
 * Provides conditional logging based on environment
 * Prevents console.log statements in production for better performance and security
 */

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'development';

/**
 * Logger object with conditional console methods
 * Only logs in development environment
 */
export const logger = {
  /**
   * Log general information (console.log)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (console.error)
   * Always logs errors even in production for critical issues
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  /**
   * Log warning messages (console.warn)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log informational messages (console.info)
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log debug messages (console.debug)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log table data (console.table)
   * @param {any} data - Data to display in table format
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Start a timer (console.time)
   * @param {string} label - Timer label
   */
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * End a timer (console.timeEnd)
   * @param {string} label - Timer label
   */
  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },

  /**
   * Group console messages (console.group)
   * @param {string} label - Group label
   */
  group: (label) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * End grouped console messages (console.groupEnd)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
};

/**
 * Export default logger
 */
export default logger;

