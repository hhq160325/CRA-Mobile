import type { User } from './types';

export const saveAuthToStorage = (token: string, user: User, refreshToken?: string): void => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.setItem) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            console.log("saveAuthToStorage: saved to localStorage", {
                userId: user.id,
                role: user.role,
                roleId: user.roleId,
                hasRefreshToken: !!refreshToken,
            });
        }
    } catch (e) {
        console.error("Failed to save to localStorage:", e);
        throw e;
    }
};

export const getUserFromStorage = (): User | null => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;
        }
    } catch (e) {
        console.error("Failed to get user from localStorage:", e);
    }
    return null;
};

export const getTokenFromStorage = (): string | null => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
            return localStorage.getItem("token");
        }
    } catch (e) {
        console.error("Failed to get token from localStorage:", e);
    }
    return null;
};

export const getRefreshTokenFromStorage = (): string | null => {
    try {
        if (typeof localStorage !== "undefined" && localStorage?.getItem) {
            return localStorage.getItem("refreshToken");
        }
    } catch (e) {
        console.error("Failed to get refreshToken from localStorage:", e);
    }
    return null;
};

export const clearAuthFromStorage = (): void => {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.removeItem) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("refreshToken");
            console.log("clearAuthFromStorage: User logged out successfully");
        }
    } catch (e) {
        console.error("Failed to clear localStorage:", e);
        throw e;
    }
};

export const saveTokensToStorage = (token: string, refreshToken?: string): void => {
    try {
        if (typeof localStorage !== "undefined" && localStorage?.setItem) {
            localStorage.setItem("token", token);

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            console.log("saveTokensToStorage: saved new tokens to localStorage");
        }
    } catch (e) {
        console.error("Failed to save tokens to localStorage:", e);
        throw e;
    }
};
