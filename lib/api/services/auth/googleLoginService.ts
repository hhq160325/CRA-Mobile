import { apiClient } from "../../client";
import { API_ENDPOINTS, API_CONFIG } from "../../config";
import type { User } from './types';
import { decodeJWT, createUserFromToken } from './tokenHelpers';
import { saveAuthToStorage } from './storageHelpers';

export const loginWithGoogle = async (
    idToken: string
): Promise<{ data: User | null; error: Error | null }> => {
    console.log("googleLoginService.loginWithGoogle: sending request with idToken");

    const result = await apiClient<{
        username: string;
        email: string;
        isGoogle: string;
        roleName: string | null;
        jwtToken: string;
        refreshToken: string | null;
    }>(API_ENDPOINTS.LOGIN_GOOGLE, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });

    console.log("googleLoginService.loginWithGoogle: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
        error: result.error?.message,
    });

    if (result.error) {
        console.error("googleLoginService.loginWithGoogle: error details", result.error);
        return { data: null, error: result.error };
    }

    console.log("googleLoginService.loginWithGoogle: raw API response", result.data);

    try {
        const token = result.data.jwtToken;
        const decodedToken = decodeJWT(token);

        const user = createUserFromToken(decodedToken, result.data.email);

        if (!user) {
            return { data: null, error: new Error("Failed to create user from token") };
        }

        // Save to storage with refresh token
        saveAuthToStorage(token, user, result.data.refreshToken || undefined);

        return { data: user, error: null };
    } catch (e) {
        console.error("googleLoginService.loginWithGoogle: error processing token", e);
        return { data: null, error: e as Error };
    }
};

export const getGoogleLoginUrl = (): string => {
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN_GOOGLE}`;
};
