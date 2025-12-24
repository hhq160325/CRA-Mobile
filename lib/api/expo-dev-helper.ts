import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_CONFIG } from './config';

export interface ExpoDevInfo {
    isExpoGo: boolean;
    isExpoDevClient: boolean;
    isStandalone: boolean;
    platform: string;
    apiUrl: string;
    recommendations: string[];
}

export function getExpoDevInfo(): ExpoDevInfo {
    const appOwnership = Constants.appOwnership;
    const isExpoGo = appOwnership === 'expo';
    const isExpoDevClient = appOwnership === 'expo' && !!Constants.expoConfig;

    // Detect standalone apps - handle both old and new Expo versions
    const isStandalone =
        // Old Expo versions
        (appOwnership as any) === 'standalone' ||
        // New Expo versions - check execution environment
        (appOwnership !== 'expo' && Constants.executionEnvironment === 'standalone') ||
        // Alternative check - if not expo and not in development
        (appOwnership !== 'expo' && !__DEV__);

    const recommendations: string[] = [];

    // Add platform-specific recommendations
    if (isExpoGo) {
        recommendations.push(' Using Expo Go - Azure URL works perfectly');
        recommendations.push(' No tunnel needed - direct Azure connection');
    } else if (isStandalone) {
        recommendations.push(' Standalone app - production-like environment');
        recommendations.push(' Direct Azure connection optimized');
    } else if (!isExpoGo && !isStandalone) {
        recommendations.push(' Development build or bare workflow');
        recommendations.push(' Custom native code supported');
    }

    if (Platform.OS === 'android') {
        recommendations.push(' Android detected - optimized for mobile networks');
    } else if (Platform.OS === 'ios') {
        recommendations.push(' iOS detected - using iOS-optimized settings');
    }

    // Check for potential issues
    if (API_CONFIG.BASE_URL.includes('localhost')) {
        recommendations.push(' Localhost detected - won\'t work on physical devices');
        recommendations.push(' Switch to Azure URL or use tunnel');
    }

    if (API_CONFIG.BASE_URL.includes('ngrok')) {
        recommendations.push('Ngrok tunnel detected - may expire during development');
        recommendations.push(' Consider using Azure URL directly for stability');
    }

    return {
        isExpoGo,
        isExpoDevClient,
        isStandalone,
        platform: Platform.OS,
        apiUrl: API_CONFIG.BASE_URL,
        recommendations,
    };
}

export function logExpoDevInfo() {
    const info = getExpoDevInfo();

    console.group(' Expo Development Info');
    const getAppType = () => {
        if (info.isExpoGo) return 'Expo Go';
        if (info.isStandalone) return 'Standalone';
        return 'Development Build / Bare Workflow';
    };

    console.log('App Type:', getAppType());
    console.log('Platform:', info.platform);
    console.log('API URL:', info.apiUrl);
    console.log('Recommendations:');
    info.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.groupEnd();

    return info;
}

export function getOptimalExpoConfig() {
    const info = getExpoDevInfo();

    // Platform-specific timeout configuration
    const getOptimalTimeout = () => {
        if (Platform.OS === 'ios') {
            return info.isExpoGo ? 35000 : 30000; // Longer timeout for iOS
        }
        return info.isExpoGo ? 25000 : 20000; // Standard timeout for Android
    };

    // iOS-specific headers for better network performance
    const iosHeaders = Platform.OS === 'ios' ? {
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'application/json, text/plain, */*',
    } : {};

    // Optimal settings for Expo development
    const config = {
        timeout: getOptimalTimeout(),
        retries: Platform.OS === 'ios' ? 2 : 1, // More retries for iOS
        headers: {
            'User-Agent': `ExpoApp/${Constants.expoVersion} (${Platform.OS})`,
            'X-Expo-Platform': Platform.OS,
            'Cache-Control': 'no-cache',
            ...iosHeaders,
        },
        enableLogging: true,
    };

    if (__DEV__) {
        console.log("🔧 Using optimal Expo config:", config);

        // Add iOS-specific recommendations
        if (Platform.OS === 'ios') {
            console.log("📱 iOS-specific optimizations applied:");
            console.log("   • Extended timeout:", config.timeout + "ms");
            console.log("   • Additional retry attempts:", config.retries);
            console.log("   • iOS-optimized headers");
        }
    }

    return config;
}

// Auto-initialize on import in development
if (__DEV__) {
    setTimeout(() => {
        logExpoDevInfo();
    }, 1000);
}