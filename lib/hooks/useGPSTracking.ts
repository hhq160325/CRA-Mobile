import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { locationService } from '../services/locationService';
import { useAuth } from '../auth-context';

export function useGPSTracking() {
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [lastLocationSent, setLastLocationSent] = useState<Date | null>(null);
    const startingRef = useRef(false); // Prevent concurrent starts

    // Start GPS tracking
    const startTracking = useCallback(async () => {
        if (!user?.id) {
            setTrackingError('User not logged in');
            return false;
        }

        if (startingRef.current) {
            console.log('🎯 GPS tracking start already in progress, skipping');
            return false;
        }

        if (isTracking) {
            console.log('🎯 GPS tracking already active, skipping start');
            return true;
        }

        try {
            startingRef.current = true;
            setTrackingError(null);
            console.log('🎯 Starting GPS tracking for user:', user.id);

            const success = await locationService.startTracking(user.id, 60000); // 60 seconds (1 minute) interval

            if (success) {
                setIsTracking(true);
                setLastLocationSent(new Date());
                console.log('🎯 GPS tracking started successfully for user:', user.id);
            } else {
                setTrackingError('Failed to start GPS tracking');
                console.log('🎯 Failed to start GPS tracking');
            }

            return success;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTrackingError(errorMessage);
            console.error('🎯 Error starting GPS tracking:', error);
            return false;
        } finally {
            startingRef.current = false;
        }
    }, [user?.id, isTracking]);

    // Stop GPS tracking
    const stopTracking = useCallback(() => {
        locationService.stopTracking();
        setIsTracking(false);
        setTrackingError(null);
        startingRef.current = false;
        console.log('🎯 GPS tracking stopped');
    }, []);

    // Handle app state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // Keep tracking in background for now
                console.log('🎯 App went to background, continuing GPS tracking');
            } else if (nextAppState === 'active' && user?.id && !isTracking && !startingRef.current) {
                // Check if tracking should be active when app becomes active
                console.log('🎯 App became active, checking GPS tracking status');
                if (locationService.isTrackingActive()) {
                    setIsTracking(true);
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [user?.id, isTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isTracking) {
                stopTracking();
            }
        };
    }, [isTracking, stopTracking]);

    return {
        isTracking,
        trackingError,
        lastLocationSent,
        startTracking,
        stopTracking,
    };
}