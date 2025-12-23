import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG } from '../config';

export interface NetworkInfo {
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    strength?: number;
    effectiveType?: string;
}

export interface PerformanceMetrics {
    networkType: string;
    connectionStrength: 'excellent' | 'good' | 'fair' | 'poor';
    recommendedTimeout: number;
    recommendedRetries: number;
    shouldUseCache: boolean;
}

class MobilePerformanceService {
    private networkInfo: NetworkInfo | null = null;
    private performanceMetrics: PerformanceMetrics | null = null;

    async initialize() {
        try {
            // Get current network information
            const netInfo = await NetInfo.fetch();
            this.networkInfo = {
                type: netInfo.type,
                isConnected: netInfo.isConnected ?? false,
                isInternetReachable: netInfo.isInternetReachable,
                // @ts-ignore - These properties exist on some network types
                strength: netInfo.details?.strength,
                // @ts-ignore
                effectiveType: netInfo.details?.effectiveType,
            };

            this.calculatePerformanceMetrics();
            console.log('Mobile Performance Service initialized:', this.performanceMetrics);
        } catch (error) {
            console.error('Failed to initialize mobile performance service:', error);
        }
    }

    private calculatePerformanceMetrics() {
        if (!this.networkInfo) return;

        const { type, isConnected, isInternetReachable } = this.networkInfo;

        let connectionStrength: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
        let recommendedTimeout = API_CONFIG.TIMEOUT;
        let recommendedRetries = API_CONFIG.RETRY_ATTEMPTS;
        let shouldUseCache = false;

        // Adjust based on network type
        switch (type) {
            case 'wifi':
                connectionStrength = 'excellent';
                recommendedTimeout = 10000; // 10s for WiFi
                recommendedRetries = 1;
                break;

            case 'cellular':
                // Further categorize cellular connections
                const effectiveType = this.networkInfo.effectiveType;
                if (effectiveType === '4g' || effectiveType === '5g') {
                    connectionStrength = 'good';
                    recommendedTimeout = 15000;
                    recommendedRetries = 2;
                } else if (effectiveType === '3g') {
                    connectionStrength = 'fair';
                    recommendedTimeout = 25000;
                    recommendedRetries = 3;
                    shouldUseCache = true;
                } else {
                    connectionStrength = 'poor';
                    recommendedTimeout = 35000;
                    recommendedRetries = 3;
                    shouldUseCache = true;
                }
                break;

            case 'ethernet':
                connectionStrength = 'excellent';
                recommendedTimeout = 8000;
                recommendedRetries = 1;
                break;

            default:
                connectionStrength = 'fair';
                recommendedTimeout = 20000;
                recommendedRetries = 2;
                shouldUseCache = true;
        }

        // Adjust if not connected or no internet
        if (!isConnected || isInternetReachable === false) {
            connectionStrength = 'poor';
            recommendedTimeout = 5000;
            recommendedRetries = 0;
            shouldUseCache = true;
        }

        this.performanceMetrics = {
            networkType: type,
            connectionStrength,
            recommendedTimeout,
            recommendedRetries,
            shouldUseCache,
        };
    }

    getOptimizedRequestConfig(): {
        timeout: number;
        retries: number;
        headers: Record<string, string>;
        shouldUseCache: boolean;
    } {
        if (!this.performanceMetrics) {
            // Return default config if not initialized
            return {
                timeout: API_CONFIG.TIMEOUT,
                retries: API_CONFIG.RETRY_ATTEMPTS,
                headers: {
                    'Content-Type': 'application/json',
                },
                shouldUseCache: false,
            };
        }

        const { recommendedTimeout, recommendedRetries, shouldUseCache } = this.performanceMetrics;

        return {
            timeout: recommendedTimeout,
            retries: recommendedRetries,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': shouldUseCache ? 'max-age=300' : 'no-cache',
            },
            shouldUseCache,
        };
    }

    getPerformanceMetrics(): PerformanceMetrics | null {
        return this.performanceMetrics;
    }

    getNetworkInfo(): NetworkInfo | null {
        return this.networkInfo;
    }

    isOnline(): boolean {
        return this.networkInfo?.isConnected ?? false;
    }

    hasGoodConnection(): boolean {
        const strength = this.performanceMetrics?.connectionStrength;
        return strength === 'excellent' || strength === 'good';
    }
}

export const mobilePerformanceService = new MobilePerformanceService();
export default mobilePerformanceService;