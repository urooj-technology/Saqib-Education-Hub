/**
 * Cache Configuration
 * Using node-cache for in-memory caching
 * Improves performance by caching frequently accessed data
 */

const NodeCache = require('node-cache');
const logger = require('./logger');
const CONSTANTS = require('./constants');

// Create cache instance with configuration from constants
const cache = new NodeCache({
  stdTTL: CONSTANTS.CACHE.TTL, // Default TTL from constants (in seconds)
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Don't clone data (better performance, but be careful with mutations)
  deleteOnExpire: true, // Automatically delete expired keys
  enableLegacyCallbacks: false, // Use Promises instead of callbacks
  maxKeys: 1000 // Maximum number of keys to store
});

// Cache event listeners for monitoring
cache.on('set', (key, value) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key) => {
  logger.debug(`Cache DELETE: ${key}`);
});

cache.on('expired', (key, value) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

cache.on('flush', () => {
  logger.info('Cache FLUSHED');
});

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found/expired
 */
const get = (key) => {
  try {
    const value = cache.get(key);
    if (value === undefined) {
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }
    logger.debug(`Cache HIT: ${key}`);
    return value;
  } catch (error) {
    logger.error(`Cache GET error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Optional TTL in seconds (overrides default)
 * @returns {boolean} - Success status
 */
const set = (key, value, ttl = null) => {
  try {
    const success = ttl 
      ? cache.set(key, value, ttl)
      : cache.set(key, value);
    
    if (success) {
      logger.debug(`Cache SET successful: ${key}`);
    } else {
      logger.warn(`Cache SET failed: ${key}`);
    }
    return success;
  } catch (error) {
    logger.error(`Cache SET error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted keys
 */
const del = (key) => {
  try {
    return cache.del(key);
  } catch (error) {
    logger.error(`Cache DELETE error for key ${key}:`, error);
    return 0;
  }
};

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {boolean} - True if key exists
 */
const has = (key) => {
  try {
    return cache.has(key);
  } catch (error) {
    logger.error(`Cache HAS error for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all cache
 * @returns {void}
 */
const flush = () => {
  try {
    cache.flushAll();
    logger.info('Cache flushed successfully');
  } catch (error) {
    logger.error('Cache FLUSH error:', error);
  }
};

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
const getStats = () => {
  try {
    return cache.getStats();
  } catch (error) {
    logger.error('Cache STATS error:', error);
    return {
      keys: 0,
      hits: 0,
      misses: 0,
      ksize: 0,
      vsize: 0
    };
  }
};

/**
 * Get or set pattern - Get from cache, or set if not exists
 * @param {string} key - Cache key
 * @param {function} fetchFn - Function to fetch data if not in cache
 * @param {number} ttl - Optional TTL in seconds
 * @returns {Promise<any>} - Cached or fetched value
 */
const getOrSet = async (key, fetchFn, ttl = null) => {
  try {
    // Check cache first
    const cachedValue = get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Fetch from source
    logger.debug(`Cache MISS: ${key}, fetching from source...`);
    const value = await fetchFn();
    
    // Store in cache
    set(key, value, ttl);
    
    return value;
  } catch (error) {
    logger.error(`Cache GET_OR_SET error for key ${key}:`, error);
    throw error;
  }
};

/**
 * Invalidate cache by pattern (delete all keys matching pattern)
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {number} - Number of deleted keys
 */
const invalidateByPattern = (pattern) => {
  try {
    const keys = cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    const matchingKeys = keys.filter(key => regex.test(key));
    
    if (matchingKeys.length > 0) {
      const deleted = cache.del(matchingKeys);
      logger.info(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
      return deleted;
    }
    
    return 0;
  } catch (error) {
    logger.error(`Cache INVALIDATE_BY_PATTERN error for pattern ${pattern}:`, error);
    return 0;
  }
};

module.exports = {
  cache, // Export raw cache instance for advanced usage
  get,
  set,
  del,
  has,
  flush,
  getStats,
  getOrSet,
  invalidateByPattern
};

