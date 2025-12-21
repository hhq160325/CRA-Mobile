import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGPSTracking } from '../hooks/useGPSTracking';
import { useAuth } from '../auth-context';

interface GPSTrackingContextType {
    isTracking: boolean;
    trackingError: string | null;
    lastLocationSent: Date | null;
    startTracking: () => Promise<boolean>;
    stopTracking: () => void;
}

const GPSTrackingContext = createContext<GPSTrackingContextType | undefined>(undefined);

export function useGPSTrackingContext() {
    const context = useContext(GPSTrackingContext);
    if (context === undefined) {
        throw new Error('useGPSTrackingContext must be used within a GPSTrackingProvider');
    }
    return context;
}

interface GPSTrackingProviderProps {
    children: React.ReactNode;
}

export function GPSTrackingProvider({ children }: GPSTrackingProviderProps) {
    const { user } = useAuth();
    const {
        isTracking,
        trackingError,
        lastLocationSent,
        startTracking,
        stopTracking,
    } = useGPSTracking();

    const [appState, setAppState] = useState(AppState.currentState);
    const trackingStartedRef = useRef(false);

    // Handle app state changes for background tracking
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            console.log(' App state changed:', appState, '->', nextAppState);
            setAppState(nextAppState);

            // Only restart tracking if it was previously active and app becomes active
            if (nextAppState === 'active' && user?.id && !isTracking && trackingStartedRef.current) {
                console.log(' App became active, resuming GPS tracking');
                startTracking();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [appState, user?.id, isTracking, startTracking]);

    // Auto-start tracking when user logs in (only once)
    useEffect(() => {
        if (user?.id && !isTracking && !trackingStartedRef.current && appState === 'active') {
            console.log(' User logged in, starting GPS tracking (first time)');
            trackingStartedRef.current = true;
            startTracking();
        } else if (!user?.id && isTracking) {
            console.log(' User logged out, stopping GPS tracking');
            trackingStartedRef.current = false;
            stopTracking();
        }
    }, [user?.id, isTracking, appState, startTracking, stopTracking]);

    const contextValue: GPSTrackingContextType = {
        isTracking,
        trackingError,
        lastLocationSent,
        startTracking,
        stopTracking,
    };

    return (
        <GPSTrackingContext.Provider value={contextValue}>
            {children}
        </GPSTrackingContext.Provider>
    );
}