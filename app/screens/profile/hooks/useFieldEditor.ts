import { useState } from 'react';
import { Alert } from 'react-native';
import { userService } from '../../../../lib/api/services/user.service';

export const useFieldEditor = (
    userId: string | undefined,
    userEmail: string | undefined,
    userData: any,
    setUserData: (data: any) => void,
    fieldValues: any,
    setFieldValues: (fn: (prev: any) => any) => void,
    buildSafeUpdateData: (latestData: any, overrides?: any) => any
) => {
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [pendingField, setPendingField] = useState<string | null>(null);

    const handleEditField = (field: string) => {
        const sensitiveFields = ["email", "phone"];

        if (sensitiveFields.includes(field)) {
            setPendingField(field);
            setShowPasswordModal(true);
        } else {
            const currentValue = fieldValues[field as keyof typeof fieldValues] || "";
            setEditValue(currentValue);
            setEditingField(field);
        }
    };

    const handlePasswordVerification = async () => {
        if (!password) {
            Alert.alert("Password Required", "Please enter your password to continue.");
            return;
        }

        if (!userEmail) {
            Alert.alert("Error", "User email not found.");
            return;
        }

        setIsSaving(true);

        try {
            const { authService } = require("../../../../lib/api");
            const { data, error } = await authService.login({
                email: userEmail,
                password: password,
            });

            if (error || !data) {
                Alert.alert("Incorrect Password", "The password you entered is incorrect.");
                setPassword("");
                return;
            }

            setShowPasswordModal(false);
            setPassword("");

            if (pendingField) {
                setEditValue(fieldValues[pendingField as keyof typeof fieldValues] || "");
                setEditingField(pendingField);
                setPendingField(null);
            }
        } catch (err: any) {
            Alert.alert("Verification Failed", err?.message || "Failed to verify password.");
            setPassword("");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveField = async () => {
        if (!editingField) return;

        const value = editValue;

        if (!userId) {
            Alert.alert("Error", "User not found. Please login again.");
            return;
        }

        setIsSaving(true);

        try {
            const fieldMapping: Record<string, string> = {
                phone: "phoneNumber",
                email: "email",
                gender: "gender",
                address: "address",
                username: "username",
                fullname: "fullname",
            };

            const apiFieldName = fieldMapping[editingField] || editingField;
            const apiValue = value;

            const { data: currentUserData, error: fetchError } = await userService.getUserById(userId);

            if (fetchError || !currentUserData) {
                console.warn("Could not fetch current user data, using cached data");
            }

            const latestData = currentUserData || userData;

            const updateData = buildSafeUpdateData(latestData, {
                [apiFieldName]: apiValue,
            });

            const { data, error } = await userService.updateUserInfo(userId, updateData);

            if (error) {
                Alert.alert("Update Failed", error.message || "Failed to save changes. Please try again.");
                return;
            }

            setFieldValues((prev) => ({ ...prev, [editingField]: value }));

            if (data) {
                setUserData(data);
            }

            setEditingField(null);
            setEditValue("");

            Alert.alert("Success", "Profile updated successfully!");
        } catch (err: any) {
            Alert.alert("Error", err?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        editingField,
        editValue,
        isSaving,
        showPasswordModal,
        password,
        isPasswordSecure,
        pendingField,
        setEditValue,
        setIsPasswordSecure,
        setPassword,
        handleEditField,
        handlePasswordVerification,
        handleSaveField,
        setEditingField,
        setShowPasswordModal,
        setPendingField,
    };
};
