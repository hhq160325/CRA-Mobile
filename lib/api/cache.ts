

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
    private defaultTTL = 5 * 60 * 1000; // 5 minutes
    private persistentTTL = 30 * 60 * 1000; // 30 minutes
    private cacheVersion = 2; // Increment this to invalidate all existing cache

    // Initialize cache and handle version upgrades
    async initialize(): Promise<void> {
        try {
            const persistentData = await AsyncStorage.getItem('api_cache_persistent');
            if (persistentData) {
                const parsed = JSON.parse(persistentData);
                const now = Date.now();
                let validEntries = 0;
                let invalidatedEntries = 0;

                for (const [key, entry] of Object.entries(parsed)) {
                    const cacheEntry = entry as PersistentCacheEntry<any>;

                    // Check version compatibility and expiration
                    if (cacheEntry.version === this.cacheVersion && now <= cacheEntry.expiresAt) {
                        this.cache.set(key, cacheEntry);
                        validEntries++;
                    } else {
                        invalidatedEntries++;
                    }
                }

                if (invalidatedEntries > 0) {
                    console.log(` Cache version upgrade: invalidated ${invalidatedEntries} old entries, kept ${validEntries} valid entries`);
                    // Clean up persistent storage
                    await this.cleanupPersistentStorage();
                } else {
                    console.log(` Persistent cache loaded: ${validEntries} entries`);
                }
            }
        } catch (error) {
            console.warn('Failed to load persistent cache:', error);
            // Clear corrupted cache
            await AsyncStorage.removeItem('api_cache_persistent');
        }
    }

    // Clean up persistent storage to remove old entries
    private async cleanupPersistentStorage(): Promise<void> {
        try {
            const validEntries: Record<string, PersistentCacheEntry<any>> = {};

            for (const [key, entry] of this.cache.entries()) {
                if (entry.timestamp) {
                    validEntries[key] = {
                        ...entry,
                        version: this.cacheVersion
                    } as PersistentCacheEntry<any>;
                }
            }

            await AsyncStorage.setItem('api_cache_persistent', JSON.stringify(validEntries));
            console.log(` Cleaned up persistent storage: ${Object.keys(validEntries).length} valid entries saved`);
        } catch (error) {
            console.warn('Failed to cleanup persistent storage:', error);
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
        // Validate data integrity before caching
        if (!this.validateEntry(key, data)) {
            console.warn(` Cache validation failed for key ${key} - not caching invalid data`);
            return;
        }

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

        if (__DEV__) {
            console.log(` Cache SET: ${key} (TTL: ${Math.round((ttl || this.defaultTTL) / 1000)}s, validated: ✓)`);
        }
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

    // Smart invalidation with data integrity checks
    invalidatePattern(pattern: string): void {
        let count = 0;
        const matchedKeys: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                matchedKeys.push(key);
                count++;
            }
        }
        if (count > 0) {
            console.log(` Cache INVALIDATED: ${count} entries matching "${pattern}"`);
            if (__DEV__ && matchedKeys.length > 0) {
                console.log(` Invalidated keys:`, matchedKeys.slice(0, 5));
            }
            // Also clean up persistent storage
            this.cleanupPersistentStorage();
        } else {
            console.log(` Cache INVALIDATION: No entries found matching "${pattern}"`);
        }
    }

    // Validate cache data integrity
    validateEntry<T>(key: string, data: T): boolean {
        try {
            // Basic validation for staff booking data
            if (key.includes('staff:payment:') && data && typeof data === 'object') {
                const paymentData = data as any;
                // Check if required payment fields exist
                return typeof paymentData.isRentalFeePaid === 'boolean' &&
                    typeof paymentData.isBookingFeePaid === 'boolean';
            }

            if (key.includes('staff:checkinout:') && data && typeof data === 'object') {
                const checkInOutData = data as any;
                // Check if required check-in/out fields exist
                return typeof checkInOutData.hasCheckIn === 'boolean' &&
                    typeof checkInOutData.hasCheckOut === 'boolean';
            }

            return true; // Default to valid for other data types
        } catch (error) {
            console.warn(`Cache validation failed for key ${key}:`, error);
            return false;
        }
    }

    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        AsyncStorage.removeItem('api_cache_persistent');
        console.log(` Cache CLEARED: ${size} entries removed, persistent cache deleted`);
    }

    // Force clear all cache including persistent storage
    async clearAll(): Promise<void> {
        const size = this.cache.size;
        this.cache.clear();

        try {
            // AGGRESSIVE FIX: Clear all possible cache storage locations
            await AsyncStorage.removeItem('api_cache_persistent');

            // Also clear any other potential cache keys that might exist
            const allKeys = await AsyncStorage.getAllKeys();
            const cacheKeys = allKeys.filter(key =>
                key.includes('cache') ||
                key.includes('staff') ||
                key.includes('booking') ||
                key.includes('payment') ||
                key.includes('car:') ||
                key.includes('user:')
            );

            if (cacheKeys.length > 0) {
                console.log(` AGGRESSIVE CLEAR: Removing ${cacheKeys.length} additional cache keys from AsyncStorage`);
                await AsyncStorage.multiRemove(cacheKeys);
                console.log(` AGGRESSIVE CLEAR: Additional cache keys removed:`, cacheKeys.slice(0, 5));
            }

            console.log(` ALL CACHE CLEARED: ${size} entries removed, persistent storage cleared, ${cacheKeys.length} additional keys removed`);
        } catch (error) {
            console.warn('Failed to clear persistent cache:', error);
        }
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

        if (removed > 0 && __DEV__) {
            console.log(` Cache cleanup: removed ${removed} expired entries`);
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