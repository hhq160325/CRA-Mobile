import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { User } from './types';

export const getUserById = async (
    userId: string
): Promise<{ data: User | null; error: Error | null }> => {
    console.log("paymentUserService.getUserById: fetching user", userId);
    const result = await apiClient<User>(API_ENDPOINTS.GET_USER(userId), {
        method: "GET",
    });
    console.log("paymentUserService.getUserById: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};
