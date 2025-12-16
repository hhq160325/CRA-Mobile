import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import type { EditFieldModalProps } from '../types/profileTypes';
import { styles } from '../styles/editFieldModal.styles';

export default function EditFieldModal({
    visible,
    editingField,
    editValue,
    isSaving,
    onValueChange,
    onSave,
    onCancel,
}: EditFieldModalProps) {
    const [validationError, setValidationError] = useState<string | null>(null);

    // Validate phone number in real-time
    useEffect(() => {
        if (editingField === "phone" && editValue) {
            const cleanPhone = editValue.replace(/\D/g, '');

            if (cleanPhone.length > 0 && cleanPhone.length < 10) {
                setValidationError(`Need ${10 - cleanPhone.length} more digits`);
            } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('0')) {
                setValidationError("Must start with 0");
            } else if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
                setValidationError(null); // Valid
            } else if (cleanPhone.length === 0) {
                setValidationError(null); // Empty is okay while typing
            }
        } else {
            setValidationError(null);
        }
    }, [editValue, editingField]);
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
        if (editingField === "phone") return "0123456789";
        return `Enter ${editingField}`;
    };

    const getHelpText = () => {
        if (editingField === "licenseNumber") return "input correct 12 number ";
        if (editingField === "licenseExpiry" || editingField === "dateOfBirth") {
            return "just input number not use '-'or '/'";
        }
        if (editingField === "phone") {
            return "Vietnamese phone number format: start with 0, exactly 10 digits (e.g., 0123456789)";
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
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.container}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.scrollView}
                                >
                                    <Text style={styles.title}>
                                        Edit {getFieldTitle()}
                                    </Text>

                                    {getHelpText() && (
                                        <Text style={styles.helpText}>
                                            {getHelpText()}
                                        </Text>
                                    )}

                                    <TextInput
                                        value={editValue}
                                        onChangeText={(text) => {
                                            if (editingField === "phone") {
                                                // Remove any non-digit characters
                                                const cleanText = text.replace(/\D/g, '');

                                                // Limit to 10 digits
                                                if (cleanText.length <= 10) {
                                                    onValueChange(cleanText);
                                                }
                                            } else {
                                                onValueChange(text);
                                            }
                                        }}
                                        placeholder={getPlaceholder()}
                                        keyboardType={
                                            editingField === "licenseNumber"
                                                ? "numeric"
                                                : editingField === "licenseExpiry" || editingField === "dateOfBirth"
                                                    ? "numeric"
                                                    : editingField === "phone"
                                                        ? "numeric"
                                                        : "default"
                                        }
                                        maxLength={editingField === "phone" ? 10 : undefined}
                                        multiline={editingField === "address"}
                                        numberOfLines={editingField === "address" ? 3 : 1}
                                        textAlignVertical={editingField === "address" ? "top" : "center"}
                                        style={[
                                            styles.input,
                                            editingField === "address" && styles.multilineInput
                                        ]}
                                        autoFocus
                                    />

                                    {/* Real-time validation error for phone */}
                                    {editingField === "phone" && validationError && (
                                        <Text style={{
                                            fontSize: scale(12),
                                            color: '#FF6B6B',
                                            marginTop: scale(8),
                                            textAlign: 'center'
                                        }}>
                                            {validationError}
                                        </Text>
                                    )}

                                    {/* Success indicator for valid phone */}
                                    {editingField === "phone" && !validationError && editValue.length === 10 && editValue.startsWith('0') && (
                                        <Text style={{
                                            fontSize: scale(12),
                                            color: '#10B981',
                                            marginTop: scale(8),
                                            textAlign: 'center'
                                        }}>
                                            ✓ Valid phone number
                                        </Text>
                                    )}

                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            onPress={onCancel}
                                            style={styles.cancelButton}
                                        >
                                            <Text style={styles.cancelButtonText}>
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={onSave}
                                            disabled={isSaving || (editingField === "phone" && validationError !== null)}
                                            style={[
                                                styles.saveButton,
                                                (isSaving || (editingField === "phone" && validationError !== null)) && styles.saveButtonDisabled
                                            ]}
                                        >
                                            {isSaving && (
                                                <ActivityIndicator
                                                    size="small"
                                                    color={colors.white}
                                                    style={styles.loadingIndicator}
                                                />
                                            )}
                                            <Text style={styles.saveButtonText}>
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
