import getAsset from '@/lib/getAsset';

export const buildSafeUpdateData = (latestData: any, overrides: any = {}) => {
    const baseData: any = {
        username: latestData?.username || "",
        fullname: latestData?.fullname || "",
        email: latestData?.email || "",
        phoneNumber: latestData?.phoneNumber || "",
        address: latestData?.address || "",
        gender: latestData?.gender !== undefined ? latestData.gender : 2,
        licenseNumber: latestData?.licenseNumber || "",
        licenseExpiry: latestData?.licenseExpiry || "",
        dateOfBirth: latestData?.dateOfBirth || null,
        imageAvatar: latestData?.imageAvatar || null,
        isCarOwner: latestData?.isCarOwner || false,
        rating: latestData?.rating || 0,
        roleId: latestData?.roleId || 1,
        isVerified: latestData?.isVerified || false,
        // IMPORTANT: Preserve the password if it exists in the original data
        password: latestData?.password || undefined,
    };

    const mergedData = { ...baseData, ...overrides };

    // Remove truly sensitive fields that should never be updated through this method
    const sensitiveFields = [
        'passwordHash',
        'passwordSalt',
        'googleId',
        'isGoogle',
        'refreshToken',
        'refreshTokens',
        'accessToken',
        'token',
        'tokens',
        'cars',
        'invoicesAsCustomer',
        'invoicesAsVendor',
        'bookingHistory',
        'id',
    ];

    sensitiveFields.forEach(field => {
        delete mergedData[field];
    });

    // Only remove password-related fields if they're not explicitly being updated
    Object.keys(mergedData).forEach(key => {
        if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass')) {
            // Don't delete the password field - we want to preserve it
            if (key !== 'password' && !overrides.hasOwnProperty(key)) {
                delete mergedData[key];
            }
        }
    });

    // Clean up undefined values to avoid sending them to the server
    Object.keys(mergedData).forEach(key => {
        if (mergedData[key] === undefined) {
            delete mergedData[key];
        }
    });

    return mergedData;
};

export const getAvatarSource = (userData: any, userAvatar: string | undefined) => {
    if (userData?.imageAvatar) {
        if (userData.imageAvatar.startsWith('http://') || userData.imageAvatar.startsWith('https://')) {
            return { uri: `${userData.imageAvatar}?t=${Date.now()}` };
        }

        const localAsset = getAsset(userData.imageAvatar);
        if (localAsset) return localAsset;
    }

    if (userAvatar) {
        if (userAvatar.startsWith('http://') || userAvatar.startsWith('https://')) {
            return { uri: `${userAvatar}?t=${Date.now()}` };
        }

        const localAsset = getAsset(userAvatar);
        if (localAsset) return localAsset;
    }

    return require('../../../../assets/male-avatar.png');
};

export const getStatusColor = (field: string, fieldValues: any, colors: any) => {
    const emptyFields = ["phone"];
    return emptyFields.includes(field) || !fieldValues[field as keyof typeof fieldValues] ? colors.red : colors.green;
};
