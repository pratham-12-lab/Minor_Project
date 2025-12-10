// Simple in-memory cache for chatbot responses with TTL
class ChatCache {
  constructor() {
    this.cache = new Map();
  }

  _getKey(userId, message) {
    return `${userId}::${message.trim().toLowerCase()}`;
  }

  get(userId, message) {
    const key = this._getKey(userId, message);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(userId, message, value, ttlMs = 5 * 60 * 1000) { // default 5 minutes
    const key = this._getKey(userId, message);
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  clear() {
    this.cache.clear();
  }
}

const globalChatCache = new ChatCache();
export default globalChatCache;
