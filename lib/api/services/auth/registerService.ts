import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { RegisterData, User } from './types';
import { saveAuthToStorage } from './storageHelpers';

export const register = async (
    data: RegisterData
): Promise<{ data: { message: string } | null; error: Error | null }> => {
    console.log("registerService.register: sending request with", data);

    const requestBody = {
        username: data.username,
        password: data.password,
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        fullname: data.fullname,
        address: data.address || "",
        gender: data.gender !== undefined ? data.gender : 0, // Default to 0 as per API example
    };

    console.log("registerService.register: request body", requestBody);

    const result = await apiClient<{ message: string }>(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify(requestBody),
    });

    console.log("registerService.register: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
        message: result.data?.message,
    });

    if (result.error) {
        console.error("registerService.register: error details", result.error);
        return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
};
