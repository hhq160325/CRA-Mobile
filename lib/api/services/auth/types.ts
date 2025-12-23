export interface ApiUserResponse {
    id: string;
    username: string;
    password: string;
    phoneNumber: string;
    email: string;
    fullname: string;
    address: string;
    imageAvatar: string | null;
    isGoogle: boolean;
    googleId: string | null;
    isCarOwner: boolean;
    rating: number;
    status: string;
    roleId: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: "customer" | "staff" | "car-owner";
    createdAt: Date | string;
    username?: string;
    address?: string;
    isCarOwner?: boolean;
    rating?: number;
    status?: string;
    roleId?: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    fullname: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    gender?: number;
}

export interface GoogleLoginData {
    idToken: string;
}

export interface RefreshTokenData {
    refreshToken: string;
}

export interface TokenResponse {
    token: string;
    refreshToken: string;
    expiresIn?: number;
}
