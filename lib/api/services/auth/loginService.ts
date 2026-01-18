import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { LoginCredentials, User } from './types';
import { decodeJWT, createUserFromToken, enrichUserWithProfile } from './tokenHelpers';
import { saveAuthToStorage, saveRememberMeCredentials } from './storageHelpers';

export const login = async (
    credentials: LoginCredentials,
    rememberMe: boolean = false
): Promise<{ data: User | null; error: Error | null }> => {
    console.log("loginService.login: sending request with", { email: credentials.email, rememberMe });

    const result = await apiClient<{ token: string; expiration?: string }>(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
        }),
    });

    // console.log("loginService.login: received response", {
    //     hasError: !!result.error,
    //     hasData: !!result.data,
    //     error: result.error?.message,
    // });

    if (result.error) {
        console.error("loginService.login: error details", result.error);
        return { data: null, error: result.error };
    }

    // console.log("loginService.login: raw API response", result.data);

    try {
        const token = result.data.token;
        const decodedToken = decodeJWT(token);

        let user = createUserFromToken(decodedToken, credentials.email);


        user = await enrichUserWithProfile(user);

        if (!user) {
            return { data: null, error: new Error("Failed to create user from token") };
        }


        await saveAuthToStorage(token, user, undefined, rememberMe);


        if (rememberMe) {
            await saveRememberMeCredentials(credentials.email, credentials.password);
        }

        return { data: user, error: null };
    } catch (e) {
        console.error("loginService.login: error processing token", e);
        return { data: null, error: e as Error };
    }
};
