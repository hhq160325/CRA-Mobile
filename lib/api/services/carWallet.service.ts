import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { getApiBaseUrl } from "../config"

export interface CarWallet {
    id: string
    carId: string
    balance: number
}

export const carWalletService = {
    async getCarWallet(carId: string): Promise<{ data: CarWallet | null; error: Error | null }> {
        console.log("carWalletService.getCarWallet: fetching wallet for car", carId)


        const baseUrl = getApiBaseUrl();
        const directUrl = `${baseUrl}/Car/${carId}`;
        console.log("carWalletService.getCarWallet: using direct URL:", directUrl);

        try {
            const response = await fetch(directUrl, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });

            console.log("carWalletService.getCarWallet: response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("carWalletService.getCarWallet: error response:", errorText);
                return {
                    data: null,
                    error: new Error(`HTTP ${response.status}: ${errorText}`)
                };
            }

            const data = await response.json();
            console.log("carWalletService.getCarWallet: success data:", data);

            return { data, error: null };
        } catch (error) {
            console.error("carWalletService.getCarWallet: fetch error:", error);
            return {
                data: null,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    },
}
