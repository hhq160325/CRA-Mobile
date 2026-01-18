import type { User } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAuthToStorage = async (token: string, user: User, refreshToken?: string, rememberMe?: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));

        if (refreshToken) {
            await AsyncStorage.setItem("refreshToken", refreshToken);
        }

        // Store remember me preference and credentials if enabled
        if (rememberMe) {
            await AsyncStorage.setItem("rememberMe", "true");
            await AsyncStorage.setItem("rememberedEmail", user.email);
        }

        console.log("saveAuthToStorage: saved to AsyncStorage", {
            userId: user.id,
            role: user.role,
            roleId: user.roleId,
            hasRefreshToken: !!refreshToken,
            rememberMe: !!rememberMe,
        });
    } catch (e) {
        console.error("Failed to save to AsyncStorage:", e);
        throw e;
    }
};

export const saveRememberMeCredentials = async (email: string, password: string): Promise<void> => {
    try {
        await AsyncStorage.setItem("rememberMe", "true");
        await AsyncStorage.setItem("rememberedEmail", email);
        await AsyncStorage.setItem("rememberedPassword", password);
        console.log("saveRememberMeCredentials: saved credentials for remember me");
    } catch (e) {
        console.error("Failed to save remember me credentials:", e);
        throw e;
    }
};

export const getRememberMeCredentials = async (): Promise<{ email: string; password: string } | null> => {
    try {
        const rememberMe = await AsyncStorage.getItem("rememberMe");
        if (rememberMe === "true") {
            const email = await AsyncStorage.getItem("rememberedEmail");
            const password = await AsyncStorage.getItem("rememberedPassword");
            if (email && password) {
                return { email, password };
            }
        }
        return null;
    } catch (e) {
        console.error("Failed to get remember me credentials:", e);
        return null;
    }
};

export const clearRememberMeCredentials = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(["rememberMe", "rememberedEmail", "rememberedPassword"]);
        console.log("clearRememberMeCredentials: cleared remember me data");
    } catch (e) {
        console.error("Failed to clear remember me credentials:", e);
        throw e;
    }
};

export const getUserFromStorage = async (): Promise<User | null> => {
    try {
        const userStr = await AsyncStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error("Failed to get user from AsyncStorage:", e);
        return null;
    }
};

export const getTokenFromStorage = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (e) {
        console.error("Failed to get token from AsyncStorage:", e);
        return null;
    }
};

export const getRefreshTokenFromStorage = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("refreshToken");
    } catch (e) {
        console.error("Failed to get refreshToken from AsyncStorage:", e);
        return null;
    }
};

export const clearAuthFromStorage = async (keepRememberMe: boolean = false): Promise<void> => {
    try {
        if (keepRememberMe) {

            await AsyncStorage.multiRemove(["token", "user", "refreshToken"]);
            console.log("clearAuthFromStorage: Logged out but kept remember me credentials");
        } else {

            await AsyncStorage.multiRemove(["token", "user", "refreshToken", "rememberMe", "rememberedEmail", "rememberedPassword"]);
            console.log("clearAuthFromStorage: User logged out completely");
        }
    } catch (e) {
        console.error("Failed to clear AsyncStorage:", e);
        throw e;
    }
};

export const saveTokensToStorage = async (token: string, refreshToken?: string): Promise<void> => {
    try {
        await AsyncStorage.setItem("token", token);

        if (refreshToken) {
            await AsyncStorage.setItem("refreshToken", refreshToken);
        }

        console.log("saveTokensToStorage: saved new tokens to AsyncStorage");
    } catch (e) {
        console.error("Failed to save tokens to AsyncStorage:", e);
        throw e;
    }
};
