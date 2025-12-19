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
            console.log('📱 Mobile Performance Service initialized:', this.performanceMetrics);
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
                    recommendedTimeout = 15000; // 15s for good cellular
                    recommendedRetries = 2;
                } else if (effectiveType === '3g') {
                    connectionStrength = 'fair';
                    recommendedTimeout = 25000; // 25s for 3G
                    recommendedRetries = 3;
                    shouldUseCache = true;
                } else {
                    connectionStrength = 'poor';
                    recommendedTimeout = 35000; // 35s for 2G/slow
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
            recommendedTimeout = 5000; // Quick timeout for offline
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
        headers: Reco