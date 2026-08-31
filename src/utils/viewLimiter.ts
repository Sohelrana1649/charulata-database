/**
 * In-memory sliding-window view rate limiter.
 * Prevents artificial inflation of view counters by repeat visits from the same IP/bot.
 *
 * Pattern: '{entityType}-view:{entityId}:{clientIp}'
 * Default Window: 30 minutes
 *
 * NOTE: This same rate-limit key pattern (e.g. `product-view:{productId}:{ip}`)
 * can later be reused for product view counts or other entity analytics if needed.
 */

class ViewRateLimiter {
  private cache: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically prune expired entries every 10 minutes to prevent memory growth
    this.cleanupInterval = setInterval(() => {
      this.prune();
    }, 10 * 60 * 1000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Checks whether a view should be counted for a visitor on an entity.
   * If not seen within the window, records the visit and returns true.
   * If already seen within the window, returns false.
   *
   * @param entityType e.g. 'blog', 'product'
   * @param entityId MongoDB ObjectId or unique slug
   * @param clientIp Client IP address
   * @param windowMs Time window in milliseconds (default: 30 minutes = 1,800,000 ms)
   * @returns boolean true if view should be counted, false if rate-limited
   */
  public shouldCountView(
    entityType: string,
    entityId: string,
    clientIp: string,
    windowMs: number = 30 * 60 * 1000
  ): boolean {
    if (!entityId || !clientIp) return true;

    // Normalize IPv6 localhost
    const normalizedIp = clientIp === '::1' || clientIp === '::ffff:127.0.0.1' ? '127.0.0.1' : clientIp.trim();
    const key = `${entityType}-view:${entityId}:${normalizedIp}`;
    const now = Date.now();
    const lastViewedAt = this.cache.get(key);

    if (lastViewedAt && now - lastViewedAt < windowMs) {
      // Already counted within the current window -> Do not increment
      return false;
    }

    // First time in window -> Record timestamp and permit increment
    this.cache.set(key, now);
    return true;
  }

  /**
   * Clean up entries older than 60 minutes
   */
  private prune(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000;
    for (const [key, timestamp] of this.cache.entries()) {
      if (now - timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Reset cache (useful for automated testing)
   */
  public reset(): void {
    this.cache.clear();
  }
}

export const viewRateLimiter = new ViewRateLimiter();
