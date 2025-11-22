import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { userService, type UserData } from '../../../../lib/api/services/user.service';

export interface FieldValues {
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseExpiry: string;
    address: string;
    fullname: string;
    username: string;
}

// Convert date from YYYY-MM-DD to DD/MM/YYYY
const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return "";

    // Check if already in DD/MM/YYYY format
    if (dateString.includes('/')) return dateString;

    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    return dateString;
};

export const useProfileData = (userId: string | undefined) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [licenseImage, setLicenseImage] = useState<string | null>(null);
    const [fieldValues, setFieldValues] = useState<FieldValues>({
        dateOfBirth: "",
        gender: "",
        phone: "",
        email: "",
        licenseNumber: "",
        licenseExpiry: "",
        address: "",
        fullname: "",
        username: "",
    });

    useEffect(() => {
        const loadUserData = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await userService.getUserById(userId);

                if (error) {
                    console.error("Failed to load user data:", error);

                    // Check if it's a 404 error (user not found)
                    const isNotFound = (error as any).status === 404 ||
                        error.message?.includes("404") ||
                        error.message?.toLowerCase().includes("not found")

                    if (isNotFound) {
                        Alert.alert(
                            "Account Not Found",
                            "Your account could not be found. You will be logged out.",
                            [{ text: "OK" }]
                        );
                    } else {
                        Alert.alert("Error", "Failed to load profile data");
                    }

                    setIsLoading(false);
                    return;
                }

                if (data) {
                    setUserData(data);
                    setFieldValues({
                        dateOfBirth: formatDateForDisplay(data.dateOfBirth),
                        gender: data.gender === 0 ? "Male" : data.gender === 1 ? "Female" : "Other",
                        phone: data.phoneNumber || "",
                        email: data.email || "",
                        licenseNumber: data.licenseNumber || "",
                        licenseExpiry: formatDateForDisplay(data.licenseExpiry),
                        address: data.address || "",
                        fullname: data.fullname || "",
                        username: data.username || "",
                    });

                    if (data.licenseImage) {
                        setLicenseImage(data.licenseImage);
                    }
                }
            } catch (err) {
                console.error("Error loading user data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [userId]);

    return {
        userData,
        setUserData,
        isLoading,
        licenseImage,
        setLicenseImage,
        fieldValues,
        setFieldValues,
    };
};
