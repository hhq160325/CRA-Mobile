import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import type { PasswordVerificationModalProps } from '../types/profileTypes';
import { styles } from '../styles/passwordVerificationModal.styles';

export default function PasswordVerificationModal({
    visible,
    password,
    isPasswordSecure,
    isSaving,
    pendingField,
    onPasswordChange,
    onToggleSecure,
    onVerify,
    onCancel,
}: PasswordVerificationModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Icon name="lock" size={scale(32)} color={colors.morentBlue} />
                        </View>
                        <Text style={styles.title}>
                            Verify Your Password
                        </Text>
                        <Text style={styles.description}>
                            For security, please enter your password to edit {pendingField === "email" ? "email" : "phone number"}.
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            value={password}
                            onChangeText={onPasswordChange}
                            placeholder="Enter your password"
                            secureTextEntry={isPasswordSecure}
                            autoFocus
                            style={styles.input}
                        />
                        <TouchableOpacity
                            onPress={onToggleSecure}
                            style={styles.toggleButton}
                        >
                            <Icon
                                name={isPasswordSecure ? "visibility-off" : "visibility"}
                                size={scale(20)}
                                color={colors.placeholder}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={isSaving}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onVerify}
                            disabled={isSaving || !password}
                            style={[
                                styles.verifyButton,
                                (isSaving || !password) && styles.verifyButtonDisabled
                            ]}
                        >
                            {isSaving && (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.white}
                                    style={styles.loadingIndicator}
                                />
                            )}
                            <Text style={styles.verifyButtonText}>
                                {isSaving ? "Verifying..." : "Verify"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
