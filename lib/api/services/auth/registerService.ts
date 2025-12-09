import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { RegisterData, User } from './types';
import { saveAuthToStorage } from './storageHelpers';

export const register = async (
    data: RegisterData
): Promise<{ data: User | null; error: Error | null }> => {
    console.log("registerService.register: sending request with", data);

    const requestBody = {
        username: data.username,
        password: data.password,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        fullname: data.fullname,
        address: data.address || "",
        gender: data.gender !== undefined ? data.gender : 2, // Default to "Other" (2)
    };

    console.log("registerService.register: request body", requestBody);

    const result = await apiClient<{ user: User; token: string }>(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify(requestBody),
    });

    console.log("registerService.register: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
    });

    if (result.error) {
        console.error("registerService.register: error details", result.error);
        return { data: null, error: result.error };
    }

    try {
        saveAuthToStorage(result.data.token, result.data.user);
        return { data: result.data.user, error: null };
    } catch (e) {
        console.error("registerService.register: error saving to storage", e);
        return { data: result.data.user, error: null }; // Still return user even if storage fails
    }
};
