import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

interface PasswordVerificationModalProps {
    visible: boolean;
    password: string;
    isPasswordSecure: boolean;
    isSaving: boolean;
    pendingField: string | null;
    onPasswordChange: (text: string) => void;
    onToggleSecure: () => void;
    onVerify: () => void;
    onCancel: () => void;
}

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
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: scale(16),
                        padding: scale(24),
                        width: "85%",
                        maxWidth: scale(350),
                    }}
                >
                    <View style={{ alignItems: "center", marginBottom: verticalScale(16) }}>
                        <View
                            style={{
                                width: scale(60),
                                height: scale(60),
                                borderRadius: scale(30),
                                backgroundColor: "#DBEAFE",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: verticalScale(12),
                            }}
                        >
                            <Icon name="lock" size={scale(32)} color={colors.morentBlue} />
                        </View>
                        <Text
                            style={{
                                fontSize: scale(18),
                                fontWeight: "700",
                                color: colors.primary,
                                marginBottom: verticalScale(8),
                            }}
                        >
                            Verify Your Password
                        </Text>
                        <Text
                            style={{
                                fontSize: scale(14),
                                color: colors.placeholder,
                                textAlign: "center",
                                lineHeight: scale(20),
                            }}
                        >
                            For security, please enter your password to edit {pendingField === "email" ? "email" : "phone number"}.
                        </Text>
                    </View>

                    <View style={{ position: "relative", marginBottom: verticalScale(20) }}>
                        <TextInput
                            value={password}
                            onChangeText={onPasswordChange}
                            placeholder="Enter your password"
                            secureTextEntry={isPasswordSecure}
                            autoFocus
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: scale(8),
                                paddingHorizontal: scale(16),
                                paddingVertical: verticalScale(12),
                                paddingRight: scale(50),
                                fontSize: scale(14),
                                color: colors.primary,
                            }}
                        />
                        <TouchableOpacity
                            onPress={onToggleSecure}
                            style={{
                                position: "absolute",
                                right: scale(12),
                                top: "50%",
                                transform: [{ translateY: -scale(12) }],
                            }}
                        >
                            <Icon
                                name={isPasswordSecure ? "visibility-off" : "visibility"}
                                size={scale(20)}
                                color={colors.placeholder}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", gap: scale(12) }}>
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={isSaving}
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
                            onPress={onVerify}
                            disabled={isSaving || !password}
                            style={{
                                flex: 1,
                                paddingVertical: verticalScale(12),
                                borderRadius: scale(8),
                                backgroundColor: isSaving || !password ? colors.placeholder : colors.morentBlue,
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
                                {isSaving ? "Verifying..." : "Verify"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
