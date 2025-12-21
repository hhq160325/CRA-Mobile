import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { TokenResponse } from './types';
import { getRefreshTokenFromStorage, saveTokensToStorage } from './storageHelpers';

export const refreshToken = async (
    refreshToken?: string
): Promise<{ data: TokenResponse | null; error: Error | null }> => {
    console.log("tokenRefreshService.refreshToken: sending request");

    // Get refresh token from parameter or storage
    let token = refreshToken;
    if (!token) {
        token = (await getRefreshTokenFromStorage()) || undefined;
    }

    if (!token) {
        return { data: null, error: new Error("No refresh token available") };
    }

    const result = await apiClient<TokenResponse>(API_ENDPOINTS.REFRESH_TOKEN, {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
    });

    console.log("tokenRefreshService.refreshToken: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
        error: result.error?.message,
    });

    if (result.error) {
        console.error("tokenRefreshService.refreshToken: error details", result.error);
        return { data: null, error: result.error };
    }

    try {
        // Save new tokens to storage
        await saveTokensToStorage(result.data.token, result.data.refreshToken);
        return { data: result.data, error: null };
    } catch (e) {
        console.error("tokenRefreshService.refreshToken: error saving tokens", e);
        return { data: result.data, error: null };
    }
};
