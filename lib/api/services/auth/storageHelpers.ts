import type { User } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAuthToStorage = async (token: string, user: User, refreshToken?: string): Promise<void> => {
    try {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));

        if (refreshToken) {
            await AsyncStorage.setItem("refreshToken", refreshToken);
        }

        console.log("saveAuthToStorage: saved to AsyncStorage", {
            userId: user.id,
            role: user.role,
            roleId: user.roleId,
            hasRefreshToken: !!refreshToken,
        });
    } catch (e) {
        console.error("Failed to save to AsyncStorage:", e);
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

export const clearAuthFromStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(["token", "user", "refreshToken"]);
        console.log("clearAuthFromStorage: User logged out successfully");
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
