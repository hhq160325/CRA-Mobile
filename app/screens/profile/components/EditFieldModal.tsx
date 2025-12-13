import React from 'react';
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
        if (editingField === "licenseNumber") return "input correct 12 number ";
        if (editingField === "licenseExpiry" || editingField === "dateOfBirth") {
            return "just input number not use '-'or '/'";
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
                                        style={[
                                            styles.input,
                                            editingField === "address" && styles.multilineInput
                                        ]}
                                        autoFocus
                                    />

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
                                            disabled={isSaving}
                                            style={[
                                                styles.saveButton,
                                                isSaving && styles.saveButtonDisabled
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
