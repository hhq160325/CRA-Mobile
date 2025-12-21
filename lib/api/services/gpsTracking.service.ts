import { API_CONFIG } from '../config';

export interface LocationData {
    latitude: number;
    longitude: number;
    speed: number;
    userId: string;
    deviceId: string;
}

export interface LocationResponse extends LocationData {
    timestamp: string;
    user: any | null;
}

export interface UserLocationHistory {
    latitude: number;
    longitude: number;
    speed: number;
    userId: string;
    deviceId: string;
    timestamp: string;
    user: {
        id: string;
        username: string;
        fullname: string;
        email: string;
        phoneNumber: string;
        imageAvatar: string;
        status: string;
        roleId: number;
    };
}

class GPSTrackingService {
    private baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Remove /api suffix for GPS endpoints


    async sendLocationData(locationData: LocationData): Promise<{
        data?: LocationResponse;
        error?: { message: string };
    }> {
        try {
            console.log(' Sending location data:', locationData);
            console.log(' Base URL:', this.baseUrl);
            console.log(' Full API URL:', `${this.baseUrl}/FromDevice`);

            const response = await fetch(`${this.baseUrl}/FromDevice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(locationData),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(' Location data sent successfully:', data);

            return { data };
        } catch (error) {
            console.error(' Error sending location data:', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Failed to send location data'
                }
            };
        }
    }


    async getUserLocationHistory(userId: string): Promise<{
        data?: UserLocationHistory[];
        error?: { message: string };
    }> {
        try {
            console.log(' Fetching location history for user:', userId);
            console.log(' Base URL:', this.baseUrl);
            console.log(' Full API URL:', `${this.baseUrl}/ByUser/${userId}`);

            const response = await fetch(`${this.baseUrl}/ByUser/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
            });

            console.log(' Response status:', response.status, response.statusText);

            if (response.status === 404) {
                console.log(' No location data found for user (404)');
                return {
                    error: {
                        message: 'No GPS location data found for this user. User may not have started GPS tracking yet.'
                    }
                };
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.log(' Error response body:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log(' Location history fetched:', data?.length || 0, 'records');

            // Handle empty array response
            if (Array.isArray(data) && data.length === 0) {
                return {
                    error: {
                        message: 'No GPS location data found for this user. User may not have started GPS tracking yet.'
                    }
                };
            }

            return { data };
        } catch (error) {
            console.error(' Error fetching location history:', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Failed to fetch location history'
                }
            };
        }
    }

    /**
     * Get the latest location for a user
     */
    async getLatestUserLocation(userId: string): Promise<{
        data?: UserLocationHistory;
        error?: { message: string };
    }> {
        try {
            console.log(' GPS Service: Getting latest location for userId:', userId);
            console.log(' GPS Service: Expected userId from logs: 019a9f03-d063-79a6-937c-0611d4f49f12');

            const result = await this.getUserLocationHistory(userId);

            if (result.error || !result.data || result.data.length === 0) {
                console.log(' GPS Service: No data found or error:', result.error?.message);
                return {
                    error: {
                        message: result.error?.message || 'No location data found'
                    }
                };
            }

            // Sort by timestamp to get the latest
            const sortedData = result.data.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            console.log(' GPS Service: Found', result.data.length, 'location records');
            console.log(' GPS Service: Latest location:', sortedData[0]);

            return { data: sortedData[0] };
        } catch (error) {
            console.error(' Error getting latest location:', error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Failed to get latest location'
                }
            };
        }
    }
}

export const gpsTrackingService = new GPSTrackingService();