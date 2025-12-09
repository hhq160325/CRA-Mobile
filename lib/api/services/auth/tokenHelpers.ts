import type { User } from './types';

export const decodeJWT = (token: string): any => {
    try {
        const tokenParts = token.split('.');
        console.log("decodeJWT: token has", tokenParts.length, "parts");

        if (tokenParts.length !== 3) {
            throw new Error("Invalid JWT format");
        }

        const payload = tokenParts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

        let jsonPayload: string;
        try {
            jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
        } catch (e) {
            console.log("atob failed, using Buffer fallback");
            if (typeof Buffer !== 'undefined') {
                jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            } else {
                throw new Error("Cannot decode base64 in this environment");
            }
        }

        const decodedToken = JSON.parse(jsonPayload);
        console.log("decodeJWT: decoded JWT", JSON.stringify(decodedToken, null, 2));
        return decodedToken;
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        throw new Error("Failed to decode authentication token");
    }
};

export const extractRoleFromToken = (decodedToken: any): "customer" | "staff" | "car-owner" => {
    const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const isCarOwner = decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true;

    console.log("=== DEBUG: Role Detection ===");
    console.log("roleFromToken:", roleFromToken);
    console.log("roleFromToken type:", typeof roleFromToken);
    console.log("isCarOwner:", isCarOwner);
    console.log("Checking if roleFromToken === '1002':", roleFromToken === "1002");
    console.log("Checking if parseInt(roleFromToken) === 1002:", parseInt(roleFromToken) === 1002);

    if (roleFromToken === "1002" || roleFromToken === 1002 || parseInt(roleFromToken) === 1002) {
        console.log("✅ Detected STAFF role");
        return "staff";
    } else if (isCarOwner) {
        console.log("✅ Detected CAR-OWNER role");
        return "car-owner";
    } else {
        console.log("✅ Detected CUSTOMER role (default)");
        return "customer";
    }
};

export const createUserFromToken = (decodedToken: any, email?: string): User => {
    const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const isCarOwner = decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true;
    const role = extractRoleFromToken(decodedToken);

    const user: User = {
        id: decodedToken.sub || "",
        name: decodedToken.name || "",
        email: decodedToken.email || email || "",
        phone: decodedToken.phone || "",
        role: role,
        roleId: parseInt(roleFromToken) || 1,
        isCarOwner: isCarOwner,
        createdAt: new Date().toISOString(),
    };

    console.log("createUserFromToken: created user from JWT", user);
    return user;
};

export const enrichUserWithProfile = async (user: User): Promise<User> => {
    if (!user.id) {
        return user;
    }

    try {
        console.log("enrichUserWithProfile: fetching full user profile for", user.id);
        const { userService } = require('../user.service');
        const profileResult = await userService.getUserById(user.id);

        if (profileResult.data) {
            console.log("enrichUserWithProfile: got full profile data");

            // Preserve role and roleId from JWT token
            const preservedRole = user.role;
            const preservedRoleId = user.roleId;

            const enrichedUser: User = {
                ...user,
                name: profileResult.data.fullname || user.name,
                username: profileResult.data.username,
                phone: profileResult.data.phoneNumber || user.phone,
                address: profileResult.data.address,
                avatar: profileResult.data.imageAvatar || undefined,
                // Ensure role is not overwritten
                role: preservedRole,
                roleId: preservedRoleId,
            };

            console.log("enrichUserWithProfile: merged user data (role preserved)", enrichedUser);
            return enrichedUser;
        }
    } catch (profileErr) {
        console.log("enrichUserWithProfile: could not fetch profile, using JWT data only");
    }

    return user;
};
