

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface PersistentCacheEntry<T> extends CacheEntry<T> {
    version: number;
}

class APICache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL = 5 * 60 * 1000;
    private persistentTTL = 30 * 60 * 1000;
    private cacheVersion = 1;


    async initialize(): Promise<void> {
        try {
            const persistentData = await AsyncStorage.getItem('api_cache_persistent');
            if (persistentData) {
                const parsed = JSON.parse(persistentData);
                const now = Date.now();

                for (const [key, entry] of Object.entries(parsed)) {
                    const cacheEntry = entry as PersistentCacheEntry<any>;

                    if (now <= cacheEntry.expiresAt && cacheEntry.version === this.cacheVersion) {
                        this.cache.set(key, cacheEntry);
                    }
                }
                console.log(` Persistent cache loaded: ${this.cache.size} entries`);
            }
        } catch (error) {
            console.warn('Failed to load persistent cache:', error);
        }
    }


    private async saveToPersistent(key: string, entry: CacheEntry<any>): Promise<void> {
        try {

            if (key.includes('staff') || key.includes('booking') || key.includes('car:') || key.includes('user:')) {
                const persistentEntry: PersistentCacheEntry<any> = {
                    ...entry,
                    version: this.cacheVersion
                };

                const existingData = await AsyncStorage.getItem('api_cache_persistent');
                const persistentCache = existingData ? JSON.parse(existingData) : {};
                persistentCache[key] = persistentEntry;

                await AsyncStorage.setItem('api_cache_persistent', JSON.stringify(persistentCache));
            }
        } catch (error) {
            console.warn('Failed to save to persistent cache:', error);
        }
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }


        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // console.log(` Cache HIT: ${key} (age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
        return entry.data;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        const now = Date.now();
        const expiresAt = now + (ttl || this.defaultTTL);

        const entry: CacheEntry<T> = {
            data,
            timestamp: now,
            expiresAt,
        };

        this.cache.set(key, entry);

        // Save to persistent storage for important data
        if (ttl && ttl >= this.persistentTTL) {
            this.saveToPersistent(key, entry);
        }

        // console.log(` Cache SET: ${key} (TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s)`);
    }

    // Batch set for better performance
    setBatch<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
        const now = Date.now();

        for (const { key, data, ttl } of entries) {
            const expiresAt = now + (ttl || this.defaultTTL);
            const entry: CacheEntry<T> = {
                data,
                timestamp: now,
                expiresAt,
            };

            this.cache.set(key, entry);

            // Save to persistent storage for important data
            if (ttl && ttl >= this.persistentTTL) {
                this.saveToPersistent(key, entry);
            }
        }

        // console.log(` Cache BATCH SET: ${entries.length} entries`);
    }

    invalidate(key: string): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            // console.log(`Cache INVALIDATED: ${key}`);
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
            // console.log(` Cache INVALIDATED: ${count} entries matching "${pattern}"`);
        }
    }

    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        AsyncStorage.removeItem('api_cache_persistent');
        // console.log(` Cache CLEARED: ${size} entries removed`);
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
            // console.log(` Cache CLEANUP: ${removed} expired entries removed`);
        }
    }
}


export const apiCache = new APICache();


apiCache.initialize();


if (__DEV__) {
    setInterval(() => {
        apiCache.cleanup();
    }, 5 * 60 * 1000);
}


export const cacheKeys = {
    cars: () => 'cars:all',
    car: (id: string) => `car:${id}`,
    carRate: (id: string) => `car:${id}:rate`,
    bookings: (userId: string) => `bookings:user:${userId}`,
    booking: (id: string) => `booking:${id}`,
    user: (id: string) => `user:${id}`,
    userLicense: (userId: string) => `user:${userId}:license`,

    staffBookings: () => 'staff:bookings:all',
    staffBookingDetails: (id: string) => `staff:booking:${id}:details`,
    staffPaymentDetails: (id: string) => `staff:payment:${id}`,
    staffExtensionInfo: (id: string) => `staff:extension:${id}`,
    staffCheckInOut: (id: string) => `staff:checkinout:${id}`,
};