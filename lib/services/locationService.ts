import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gpsTrackingService } from '../api/services/gpsTracking.service';
import { normalizeSpeed } from '../utils/gpsUtils';

export interface LocationPosition {
    latitude: number;
    longitude: number;
    speed: number | null;
}

class LocationService {
    private watchId: Location.LocationSubscription | null = null;
    private deviceId: string | null = null;
    private isTracking = false;
    private trackingInterval: NodeJS.Timeout | null = null;
    private permissionGranted: boolean | null = null; // Cache permission status
    private permissionRequested = false; // Track if permission was already requested

    /**
     * Generate or retrieve device ID
     */
    async getDeviceId(): Promise<string> {
        if (this.deviceId) {
            return this.deviceId;
        }

        try {
            // Try to get stored device ID first
            const storedDeviceId = await AsyncStorage.getItem('device_id');

            if (storedDeviceId) {
                this.deviceId = storedDeviceId;
                return storedDeviceId;
            }

            // Generate new device ID using crypto
            const randomBytes = await Crypto.getRandomBytesAsync(6);
            const randomString = Array.from(randomBytes)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();

            const generatedId = `DEVICE_${randomString.slice(0, 6)}`;

            // Store for future use
            await AsyncStorage.setItem('device_id', generatedId);
            this.deviceId = generatedId;

            console.log('📱 Generated new device ID:', generatedId);
            return generatedId;
        } catch (error) {
            console.error('📱 Error generating device ID:', error);
            // Fallback to timestamp-based ID
            const fallbackId = `DEVICE_${Date.now().toString().slice(-6)}`;
            this.deviceId = fallbackId;
            return fallbackId;
        }
    }

    /**
     * Check if permission is already granted (without requesting)
     */
    async checkLocationPermission(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            const granted = status === 'granted';
            this.permissionGranted = granted;
            return granted;
        } catch (error) {
            console.error('📍 Error checking location permission:', error);
            return false;
        }
    }

    /**
     * Request location permissions (including background) - only once
     */
    async requestLocationPermission(): Promise<boolean> {
        // If permission already granted, return immediately
        if (this.permissionGranted === true) {
            console.log('📍 Location permission already granted');
            return true;
        }

        // If permission was already requested in this session, check status instead
        if (this.permissionRequested) {
            console.log('📍 Permission already requested, checking status');
            return await this.checkLocationPermission();
        }

        try {
            // Mark as requested to prevent multiple requests
            this.permissionRequested = true;

            // Check if already granted first
            const alreadyGranted = await this.checkLocationPermission();
            if (alreadyGranted) {
                console.log('📍 Location permission already granted (checked before request)');
                return true;
            }

            console.log('📍 Requesting location permissions...');

            // Request foreground permissions first
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

            if (foregroundStatus !== 'granted') {
                console.log('📍 Foreground location permission denied');
                this.permissionGranted = false;
                Alert.alert(
                    'Permission Required',
                    'Location permission is required for GPS tracking. Please enable it in settings.',
                    [{ text: 'OK' }]
                );
                return false;
            }

            console.log('📍 Foreground location permission granted');

            // Request background permissions for continuous tracking
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus === 'granted') {
                console.log('📍 Background location permission granted');
                this.permissionGranted = true;
                return true;
            } else {
                console.log('📍 Background location permission denied, using foreground only');
                // Still allow foreground tracking
                this.permissionGranted = true;
                return true;
            }
        } catch (error) {
            console.error('📍 Error requesting location permission:', error);
            this.permissionGranted = false;
            return false;
        }
    }

    /**
     * Get current location
     * Note: Speed defaults to 10 km/h when GPS doesn't provide speed data
     */
    async getCurrentLocation(): Promise<LocationPosition | null> {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                timeInterval: 10000,
                distanceInterval: 10,
            });

            const position: LocationPosition = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                speed: normalizeSpeed(location.coords.speed), // Use utility function for speed normalization
            };

            console.log('📍 Current location:', position);
            return position;
        } catch (error) {
            console.error('📍 Error getting location:', error);
            return null;
        }
    }

    /**
     * Send location data to server
     */
    async sendLocationToServer(userId: string, location: LocationPosition): Promise<boolean> {
        try {
            const deviceId = await this.getDeviceId();

            const locationData = {
                latitude: location.latitude,
                longitude: location.longitude,
                speed: normalizeSpeed(location.speed), // Use utility function for speed normalization
                userId,
                deviceId,
            };

            console.log('📍 Preparing to send location data:', locationData);
            console.log('📍 User ID:', userId);
            console.log('📍 Device ID:', deviceId);

            const result = await gpsTrackingService.sendLocationData(locationData);

            if (result.error) {
                console.error('📍 Failed to send location:', result.error.message);
                return false;
            }

            console.log('📍 Location sent successfully to server');
            console.log('📍 Server response:', result.data);
            return true;
        } catch (error) {
            console.error('📍 Error sending location to server:', error);
            return false;
        }
    }

    /**
     * Start location tracking
     */
    async startTracking(userId: string, intervalMs: number = 60000): Promise<boolean> {
        if (this.isTracking) {
            console.log('📍 Location tracking already active, skipping start');
            return true;
        }

        console.log('📍 Starting location tracking for user:', userId);

        // Check permission first (without requesting)
        const hasPermission = await this.checkLocationPermission();

        if (!hasPermission) {
            // Only request if not already granted
            const granted = await this.requestLocationPermission();
            if (!granted) {
                console.log('📍 Location permission not granted, cannot start tracking');
                return false;
            }
        }

        try {
            this.isTracking = true;
            console.log('📍 Starting location tracking...');

            // Send initial location
            const initialLocation = await this.getCurrentLocation();
            if (initialLocation) {
                await this.sendLocationToServer(userId, initialLocation);
            }

            // Set up periodic location updates
            this.trackingInterval = setInterval(async () => {
                if (!this.isTracking) return;

                const location = await this.getCurrentLocation();
                if (location) {
                    await this.sendLocationToServer(userId, location);
                }
            }, intervalMs);

            console.log('📍 Location tracking started with interval:', intervalMs, 'ms');
            return true;
        } catch (error) {
            console.error('📍 Error starting location tracking:', error);
            this.isTracking = false;
            return false;
        }
    }

    /**
     * Stop location tracking
     */
    stopTracking(): void {
        console.log('📍 Stopping location tracking...');

        this.isTracking = false;

        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }

        if (this.watchId) {
            this.watchId.remove();
            this.watchId = null;
        }

        console.log('📍 Location tracking stopped');
    }

    /**
     * Check if tracking is active
     */
    isTrackingActive(): boolean {
        return this.isTracking;
    }

    /**
     * Reset permission state (for testing)
     */
    resetPermissionState(): void {
        this.permissionGranted = null;
        this.permissionRequested = false;
    }
}

export const locationService = new LocationService();