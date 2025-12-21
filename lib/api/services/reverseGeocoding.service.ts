import { API_CONFIG } from '../config';

export interface ReverseGeocodingRequest {
    latitude: string | number;
    longitude: string | number;
}

export interface ReverseGeocodingResponse {
    formattedAddress: string;
    oldFormattedAddress: string;
}

class ReverseGeocodingService {
    private baseUrl = API_CONFIG.BASE_URL;


    async getAddressFromCoordinates(
        latitude: number,
        longitude: number
    ): Promise<{
        data?: ReverseGeocodingResponse;
        error?: { message: string };
    }> {
        try {
            console.log(' Getting address for coordinates:', latitude, longitude);

            const requestData: ReverseGeocodingRequest = {
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            };

            const response = await fetch(`${this.baseUrl}/TrackAsia/GetReverseGeocoding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(' Address retrieved:', data.formattedAddress);

            return { data };
        } catch (error) {
            console.error(' Error getting address:', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Failed to get address'
                }
            };
        }
    }


    async getFormattedAddress(latitude: number, longitude: number): Promise<string> {
        try {
            const result = await this.getAddressFromCoordinates(latitude, longitude);

            if (result.data?.formattedAddress) {
                return result.data.formattedAddress;
            }

            // Fallback to coordinates if address not available
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        } catch (error) {
            console.error(' Error getting formatted address:', error);
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
    }


    async getOldFormattedAddress(latitude: number, longitude: number): Promise<string> {
        try {
            const result = await this.getAddressFromCoordinates(latitude, longitude);

            if (result.data?.oldFormattedAddress) {
                return result.data.oldFormattedAddress;
            }

            // Fallback to main address if old format not available
            if (result.data?.formattedAddress) {
                return result.data.formattedAddress;
            }

            // Final fallback to coordinates
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        } catch (error) {
            console.error(' Error getting old formatted address:', error);
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
    }
}

export const reverseGeocodingService = new ReverseGeocodingService();