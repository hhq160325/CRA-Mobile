import { useState, useEffect } from 'react';
import { gpsTrackingService, type UserLocationHistory } from '../api/services/gpsTracking.service';

interface UserLocationState {
    location: UserLocationHistory | null;
    loading: boolean;
    error: string | null;
    timeAgo: string;
    isRecent: boolean;
}

export function useUserLocation(userId: string) {
    const [state, setState] = useState<UserLocationState>({
        location: null,
        loading: true,
        error: null,
        timeAgo: '',
        isRecent: false,
    });

    const formatTimeAgo = (timestamp: string): { timeAgo: string; isRecent: boolean } => {
        const now = new Date();
        const locationTime = new Date(timestamp);
        const diffMs = now.getTime() - locationTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);

        let timeAgo: string;
        let isRecent = false;

        if (diffMinutes < 1) {
            timeAgo = 'Just now';
            isRecent = true;
        } else if (diffMinutes < 60) {
            timeAgo = `${diffMinutes}m ago`;
            isRecent = diffMinutes <= 30; // Recent if within 30 minutes
        } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
            isRecent = diffHours <= 2; // Recent if within 2 hours
        } else {
            const diffDays = Math.floor(diffHours / 24);
            timeAgo = `${diffDays}d ago`;
            isRecent = false;
        }

        return { timeAgo, isRecent };
    };

    const fetchUserLocation = async () => {
        if (!userId) {
            console.log('📍 useUserLocation: No user ID provided');
            setState(prev => ({ ...prev, loading: false, error: 'No user ID provided' }));
            return;
        }

        try {
            console.log('📍 useUserLocation: Fetching location for user:', userId);
            setState(prev => ({ ...prev, loading: true, error: null }));

            const result = await gpsTrackingService.getLatestUserLocation(userId);
            console.log('📍 useUserLocation: Result from service:', result);

            if (result.error) {
                console.log('📍 useUserLocation: Error from service:', result.error.message);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to fetch location',
                    location: null,
                    timeAgo: '',
                    isRecent: false,
                }));
                return;
            }

            if (result.data) {
                console.log('📍 useUserLocation: Location data received:', result.data);
                const { timeAgo, isRecent } = formatTimeAgo(result.data.timestamp);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: null,
                    location: result.data!,
                    timeAgo,
                    isRecent,
                }));
            } else {
                console.log('📍 useUserLocation: No location data in result');
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'No location data available',
                    location: null,
                    timeAgo: '',
                    isRecent: false,
                }));
            }
        } catch (error) {
            console.error('📍 useUserLocation: Exception:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                location: null,
                timeAgo: '',
                isRecent: false,
            }));
        }
    };

    useEffect(() => {
        fetchUserLocation();
    }, [userId]);

    const refetch = async () => {
        console.log('📍 useUserLocation: Manual refetch triggered');
        await fetchUserLocation();
    };

    return {
        ...state,
        refetch,
    };
}