import { API_CONFIG } from './config';
import { testConnection } from './client';

export interface APIDebugInfo {
    currentUrl: string;
    isProduction: boolean;
    connectionTest: {
        success: boolean;
        latency?: number;
        message: string;
        connectionQuality?: string;
    };
    commonIssues: string[];
    recommendations: string[];
}

export async function debugAPIConnection(): Promise<APIDebugInfo> {
    console.log('🔍 Starting API Debug...');

    const connectionTest = await testConnection();
    const isProduction = !__DEV__;

    const commonIssues: string[] = [];
    const recommendations: string[] = [];

    // Check for common issues
    if (API_CONFIG.BASE_URL.includes('ngrok')) {
        commonIssues.push('Using ngrok tunnel - may expire or become unavailable');
        recommendations.push('Consider using a stable development server or Azure directly');
    }

    if (API_CONFIG.BASE_URL.includes('localhost')) {
        commonIssues.push('Using localhost - not accessible from physical devices');
        recommendations.push('Use your computer\'s IP address or a tunnel service');
    }

    if (connectionTest.latency && connectionTest.latency > 2000) {
        commonIssues.push(`High latency detected: ${connectionTest.latency}ms`);
        recommendations.push('Check your internet connection or use a closer server');
    }

    if (!connectionTest.success) {
        commonIssues.push('Connection failed - server may be unreachable');
        recommendations.push('Verify the API URL and server status');
    }

    // ER_NGROK_3200 specific checks
    if (connectionTest.message.includes('timeout') || connectionTest.message.includes('failed')) {
        commonIssues.push('Possible tunnel or network issue');
        recommendations.push('If using ngrok: restart tunnel, check ngrok status, or switch to Azure directly');
    }

    const debugInfo: APIDebugInfo = {
        currentUrl: API_CONFIG.BASE_URL,
        isProduction,
        connectionTest,
        commonIssues,
        recommendations,
    };

    console.log('📊 API Debug Results:', debugInfo);
    return debugInfo;
}

export function logAPIError(error: any, context: string) {
    console.group(`🚨 API Error in ${context}`);
    console.error('Error:', error);
    console.log('Current API URL:', API_CONFIG.BASE_URL);
    console.log('Timestamp:', new Date().toISOString());

    // Check for specific error patterns
    if (error?.message?.includes('ER_NGROK_3200')) {
        console.warn('💡 ER_NGROK_3200 detected - This is a tunnel error');
        console.warn('Solutions:');
        console.warn('1. Restart your ngrok tunnel');
        console.warn('2. Check if ngrok is still running');
        console.warn('3. Update your API URL if tunnel changed');
        console.warn('4. Switch to Azure URL directly for testing');
    }

    if (error?.message?.includes('Network request failed')) {
        console.warn('💡 Network error detected');
        console.warn('Solutions:');
        console.warn('1. Check your internet connection');
        console.warn('2. Verify the server is running');
        console.warn('3. Check if you\'re on the same network (for localhost)');
    }

    console.groupEnd();
}

export function getRecommendedAPIConfig() {
    const isPhysicalDevice = !__DEV__ || process.env.NODE_ENV === 'production';

    if (isPhysicalDevice) {
        return {
            baseUrl: 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api',
            timeout: 15000,
            retries: 2,
            reason: 'Physical device - using stable Azure URL'
        };
    }

    return {
        baseUrl: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        retries: API_CONFIG.RETRY_ATTEMPTS,
        reason: 'Development mode - using configured URL'
    };
}