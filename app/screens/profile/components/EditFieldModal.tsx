import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface EditFieldModalProps {
    visible: boolean;
    editingField: string | null;
    editValue: string;
    isSaving: boolean;
    onValueChange: (text: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function EditFieldModal({
    visible,
    editingField,
    editValue,
    isSaving,
    onValueChange,
    onSave,
    onCancel,
}: EditFieldModalProps) {
    const getFieldTitle = () => {
        if (!editingField) return "";
        const titles: Record<string, string> = {
            licenseNumber: "License Number",
            licenseExpiry: "License Expiry",
            dateOfBirth: "Date of Birth",
            phone: "Phone Number",
            email: "Email",
            address: "Address",
            username: "Username",
            fullname: "Full Name",
            gender: "Gender",
        };
        return titles[editingField] || editingField;
    };

    const getPlaceholder = () => {
        if (editingField === "licenseNumber") return "123456789012";
        if (editingField === "licenseExpiry") return "__/__/____";
        if (editingField === "dateOfBirth") return "__/__/____";
        if (editingField === "address") return "Enter your full address";
        return `Enter ${editingField}`;
    };

    const getHelpText = () => {
        if (editingField === "licenseNumber") return "Nhập đúng 12 chữ số (tối đa 12 số)";
        if (editingField === "licenseExpiry" || editingField === "dateOfBirth") {
            return "Chỉ cần gõ số (ví dụ: gõ 09102025 sẽ thành 09/10/2025)";
        }
        return null;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <TouchableWithoutFeedback>
                            <View
                                style={{
                                    backgroundColor: colors.white,
                                    borderRadius: scale(16),
                                    padding: scale(24),
                                    width: "85%",
                                    maxWidth: scale(350),
                                    maxHeight: "80%",
                                }}
                            >
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ flexGrow: 1 }}
                                >
                                    <Text
                                        style={{
                                            fontSize: scale(18),
                                            fontWeight: "700",
                                            color: colors.primary,
                                            marginBottom: verticalScale(8),
                                        }}
                                    >
                                        Edit {getFieldTitle()}
                                    </Text>

                                    {getHelpText() && (
                                        <Text
                                            style={{
                                                fontSize: scale(12),
                                                color: colors.placeholder,
                                                marginBottom: verticalScale(16),
                                            }}
                                        >
                                            {getHelpText()}
                                        </Text>
                                    )}

                                    <TextInput
                                        value={editValue}
                                        onChangeText={onValueChange}
                                        placeholder={getPlaceholder()}
                                        keyboardType={
                                            editingField === "licenseNumber"
                                                ? "numeric"
                                                : editingField === "licenseExpiry" || editingField === "dateOfBirth"
                                                    ? "numeric"
                                                    : "default"
                                        }
                                        multiline={editingField === "address"}
                                        numberOfLines={editingField === "address" ? 3 : 1}
                                        textAlignVertical={editingField === "address" ? "top" : "center"}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            borderRadius: scale(8),
                                            paddingHorizontal: scale(16),
                                            paddingVertical: verticalScale(12),
                                            fontSize: scale(14),
                                            color: colors.primary,
                                            marginBottom: verticalScale(20),
                                            minHeight: editingField === "address" ? verticalScale(80) : verticalScale(44),
                                        }}
                                        autoFocus
                                    />

                                    <View style={{ flexDirection: "row", gap: scale(12) }}>
                                        <TouchableOpacity
                                            onPress={onCancel}
                                            style={{
                                                flex: 1,
                                                paddingVertical: verticalScale(12),
                                                borderRadius: scale(8),
                                                borderWidth: 1,
                                                borderColor: colors.morentBlue,
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.morentBlue }}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={onSave}
                                            disabled={isSaving}
                                            style={{
                                                flex: 1,
                                                paddingVertical: verticalScale(12),
                                                borderRadius: scale(8),
                                                backgroundColor: isSaving ? colors.placeholder : colors.morentBlue,
                                                alignItems: "center",
                                                flexDirection: "row",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {isSaving && (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={colors.white}
                                                    style={{ marginRight: scale(8) }}
                                                />
                                            )}
                                            <Text style={{ fontSize: scale(14), fontWeight: "600", color: colors.white }}>
                                                {isSaving ? "Saving..." : "Save"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}
