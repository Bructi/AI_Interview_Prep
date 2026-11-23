// High-performance In-Memory TTL Cache for AI & Concept requests
class SimpleCache {
  constructor(defaultTtlMs = 10 * 60 * 1000, maxSize = 200) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU eviction behavior
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest item (first key in map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }
}

const aiCache = new SimpleCache(30 * 60 * 1000, 300); // 30-min TTL for repetitive concepts
module.exports = { aiCache, SimpleCache };
