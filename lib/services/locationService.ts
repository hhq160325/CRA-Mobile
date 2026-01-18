import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gpsTrackingService } from '../api/services/gpsTracking.service';
import { normalizeSpeed } from '../utils/gpsUtils';
import { logger } from '../utils/logger';

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
    private permissionGranted: boolean | null = null;
    private permissionRequested = false;


    async getDeviceId(): Promise<string> {
        if (this.deviceId) {
            return this.deviceId;
        }

        try {

            const storedDeviceId = await AsyncStorage.getItem('device_id');

            if (storedDeviceId) {
                this.deviceId = storedDeviceId;
                return storedDeviceId;
            }


            const randomBytes = await Crypto.getRandomBytesAsync(6);
            const randomString = Array.from(randomBytes)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();

            const generatedId = `DEVICE_${randomString.slice(0, 6)}`;


            await AsyncStorage.setItem('device_id', generatedId);
            this.deviceId = generatedId;

            logger.log(' Generated new device ID:', generatedId);
            return generatedId;
        } catch (error) {
            logger.error(' Error generating device ID:', error);

            const fallbackId = `DEVICE_${Date.now().toString().slice(-6)}`;
            this.deviceId = fallbackId;
            return fallbackId;
        }
    }


    async checkLocationPermission(): Promise<boolean> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            const granted = status === 'granted';
            this.permissionGranted = granted;
            return granted;
        } catch (error) {
            logger.error(' Error checking location permission:', error);
            return false;
        }
    }


    async requestLocationPermission(): Promise<boolean> {

        if (this.permissionGranted === true) {
            logger.log(' Location permission already granted');
            return true;
        }


        if (this.permissionRequested) {
            logger.log(' Permission already requested, checking status');
            return await this.checkLocationPermission();
        }

        try {

            this.permissionRequested = true;


            const alreadyGranted = await this.checkLocationPermission();
            if (alreadyGranted) {
                logger.log(' Location permission already granted (checked before request)');
                return true;
            }

            logger.log(' Requesting location permissions...');

            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

            if (foregroundStatus !== 'granted') {
                logger.log(' Foreground location permission denied');
                this.permissionGranted = false;
                Alert.alert(
                    'Permission Required',
                    'Location permission is required for GPS tracking. Please enable it in settings.',
                    [{ text: 'OK' }]
                );
                return false;
            }

            logger.log(' Foreground location permission granted');


            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus === 'granted') {
                logger.log(' Background location permission granted');
                this.permissionGranted = true;
                return true;
            } else {
                logger.log('Background location permission denied, using foreground only');

                this.permissionGranted = true;
                return true;
            }
        } catch (error) {
            logger.error('Error requesting location permission:', error);
            this.permissionGranted = false;
            return false;
        }
    }


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
                speed: normalizeSpeed(location.coords.speed),
            };

            logger.log(' Current location:', position);
            return position;
        } catch (error) {
            logger.error(' Error getting location:', error);
            return null;
        }
    }


    async sendLocationToServer(userId: string, location: LocationPosition): Promise<boolean> {
        try {
            const deviceId = await this.getDeviceId();

            const locationData = {
                latitude: location.latitude,
                longitude: location.longitude,
                speed: normalizeSpeed(location.speed),
                userId,
                deviceId,
            };

            logger.log(' Preparing to send location data:', locationData);
            logger.log(' User ID:', userId);
            logger.log(' Device ID:', deviceId);

            const result = await gpsTrackingService.sendLocationData(locationData);

            if (result.error) {
                logger.error(' Failed to send location:', result.error.message);
                return false;
            }

            logger.log(' Location sent successfully to server');
            logger.log(' Server response:', result.data);
            return true;
        } catch (error) {
            logger.error(' Error sending location to server:', error);
            return false;
        }
    }


    async startTracking(userId: string, intervalMs: number = 60000): Promise<boolean> {
        if (this.isTracking) {
            logger.log(' Location tracking already active, skipping start');
            return true;
        }

        logger.log(' Starting location tracking for user:', userId);


        const hasPermission = await this.checkLocationPermission();

        if (!hasPermission) {

            const granted = await this.requestLocationPermission();
            if (!granted) {
                logger.log(' Location permission not granted, cannot start tracking');
                return false;
            }
        }

        try {
            this.isTracking = true;
            logger.log(' Starting location tracking...');


            const initialLocation = await this.getCurrentLocation();
            if (initialLocation) {
                await this.sendLocationToServer(userId, initialLocation);
            }


            this.trackingInterval = setInterval(async () => {
                if (!this.isTracking) return;

                const location = await this.getCurrentLocation();
                if (location) {
                    await this.sendLocationToServer(userId, location);
                }
            }, intervalMs);

            logger.log(' Location tracking started with interval:', intervalMs, 'ms');
            return true;
        } catch (error) {
            logger.error(' Error starting location tracking:', error);
            this.isTracking = false;
            return false;
        }
    }


    stopTracking(): void {
        logger.log(' Stopping location tracking...');

        this.isTracking = false;

        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }

        if (this.watchId) {
            this.watchId.remove();
            this.watchId = null;
        }

        logger.log(' Location tracking stopped');
    }


    isTrackingActive(): boolean {
        return this.isTracking;
    }


    resetPermissionState(): void {
        this.permissionGranted = null;
        this.permissionRequested = false;
    }
}

export const locationService = new LocationService();