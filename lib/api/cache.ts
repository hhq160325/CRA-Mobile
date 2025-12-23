

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class APICache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL = 5 * 60 * 1000;


    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        console.log(` Cache HIT: ${key} (age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
        return entry.data;
    }


    set<T>(key: string, data: T, ttl?: number): void {
        const now = Date.now();
        const expiresAt = now + (ttl || this.defaultTTL);

        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt,
        });

        console.log(` Cache SET: ${key} (TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
    }


    invalidate(key: string): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            console.log(` Cache INVALIDATED: ${key}`);
        }
    }


    invalidatePattern(pattern: string): void {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        if (count > 0) {
            console.log(` Cache INVALIDATED: ${count} entries matching "${pattern}"`);
        }
    }


    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        console.log(` Cache CLEARED: ${size} entries removed`);
    }


    getStats() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());

        return {
            totalEntries: entries.length,
            validEntries: entries.filter(([_, entry]) => now <= entry.expiresAt).length,
            expiredEntries: entries.filter(([_, entry]) => now > entry.expiresAt).length,
            oldestEntry: entries.length > 0
                ? Math.round((now - Math.min(...entries.map(([_, e]) => e.timestamp))) / 1000)
                : 0,
        };
    }


    cleanup(): void {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`🧹 Cache CLEANUP: ${removed} expired entries removed`);
        }
    }
}

// Export singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 5 minutes
if (__DEV__) {
    setInterval(() => {
        apiCache.cleanup();
    }, 5 * 60 * 1000);
}

// Cache key generators for consistency
export const cacheKeys = {
    cars: () => 'cars:all',
    car: (id: string) => `car:${id}`,
    carRate: (id: string) => `car:${id}:rate`,
    bookings: (userId: string) => `bookings:user:${userId}`,
    booking: (id: string) => `booking:${id}`,
    user: (id: string) => `user:${id}`,
    userLicense: (userId: string) => `user:${userId}:license`,
};