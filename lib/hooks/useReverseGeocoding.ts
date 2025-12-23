import { useState, useEffect } from 'react';
import { reverseGeocodingService } from '../api/services/reverseGeocoding.service';

interface ReverseGeocodingState {
    address: string | null;
    loading: boolean;
    error: string | null;
}

// Simple cache to avoid repeated API calls for same coordinates
const addressCache = new Map<string, string>();

export function useReverseGeocoding(latitude: number, longitude: number) {
    const [state, setState] = useState<ReverseGeocodingState>({
        address: null,
        loading: false,
        error: null,
    });

    useEffect(() => {
        if (!latitude || !longitude) {
            setState({ address: null, loading: false, error: 'Invalid coordinates' });
            return;
        }

        const fetchAddress = async () => {
            // Create cache key with rounded coordinates (to avoid cache misses for tiny differences)
            const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

            // Check cache first
            if (addressCache.has(cacheKey)) {
                setState({
                    address: addressCache.get(cacheKey)!,
                    loading: false,
                    error: null,
                });
                return;
            }

            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const address = await reverseGeocodingService.getFormattedAddress(latitude, longitude);

                // Cache the result
                addressCache.set(cacheKey, address);

                setState({
                    address,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to get address';
                setState({
                    address: null,
                    loading: false,
                    error: errorMessage,
                });
            }
        };

        fetchAddress();
    }, [latitude, longitude]);

    return state;
}

/**
 * Hook for getting address without automatic fetching (manual control)
 */
export function useReverseGeocodingManual() {
    const [state, setState] = useState<ReverseGeocodingState>({
        address: null,
        loading: false,
        error: null,
    });

    const fetchAddress = async (latitude: number, longitude: number) => {
        if (!latitude || !longitude) {
            setState({ address: null, loading: false, error: 'Invalid coordinates' });
            return;
        }

        const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

        // Check cache first
        if (addressCache.has(cacheKey)) {
            setState({
                address: addressCache.get(cacheKey)!,
                loading: false,
                error: null,
            });
            return;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const address = await reverseGeocodingService.getFormattedAddress(latitude, longitude);

            // Cache the result
            addressCache.set(cacheKey, address);

            setState({
                address,
                loading: false,
                error: null,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get address';
            setState({
                address: null,
                loading: false,
                error: errorMessage,
            });
        }
    };

    const clearAddress = () => {
        setState({
            address: null,
            loading: false,
            error: null,
        });
    };

    return {
        ...state,
        fetchAddress,
        clearAddress,
    };
}