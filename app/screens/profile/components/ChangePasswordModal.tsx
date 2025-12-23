import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import { userService } from '../../../../lib/api/services/user.service';
import { StyleSheet } from 'react-native';

interface ChangePasswordModalProps {
    visible: boolean;
    userEmail: string;
    onClose: () => void;
    onLogout?: () => void;
}

export default function ChangePasswordModal({
    visible,
    userEmail,
    onClose,
    onLogout,
}: ChangePasswordModalProps) {
    const [step, setStep] = useState<'password' | 'otp'>('password');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const otpInputRefs = useRef<(TextInput | null)[]>([]);

    const resetForm = () => {
        setStep('password');
        setPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setIsPasswordSecure(true);
        setIsConfirmPasswordSecure(true);
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleOtpChange = (text: string, index: number) => {

        const numericText = text.replace(/[^0-9]/g, '');


        if (numericText.length === 6) {
            setOtpCode(numericText);

            otpInputRefs.current[5]?.focus();
            return;
        }

        if (numericText.length <= 1) {
            const newOtpCode = otpCode.split('');
            newOtpCode[index] = numericText;
            setOtpCode(newOtpCode.join(''));


            if (numericText && index < 5) {
                otpInputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {

        if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handlePasswordSubmit = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            console.log('ChangePasswordModal: initiating password change for', userEmail);
            const { data, error } = await userService.changePassword(userEmail, password, confirmPassword);
            console.log('ChangePasswordModal: changePassword response', { data, error });

            if (error) {
                console.error('ChangePasswordModal: changePassword error', error);
                Alert.alert('Error', error.message || 'Failed to initiate password change');
                return;
            }

            console.log('ChangePasswordModal: password change initiated successfully');
            Alert.alert('Success', 'Verification code sent to your email. Please check your inbox.');
            setStep('otp');

            setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 500);
        } catch (err: any) {
            console.error('ChangePasswordModal: changePassword exception', err);
            Alert.alert('Error', err?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otpCode || otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit verification code');
            return;
        }

        setIsLoading(true);
        try {
            console.log('ChangePasswordModal: verifying OTP for', userEmail, 'with code', otpCode);
            const { data, error } = await userService.verifyPasswordChange(userEmail, otpCode);
            console.log('ChangePasswordModal: verifyPasswordChange response', { data, error });

            if (error) {
                console.error('ChangePasswordModal: verifyPasswordChange error', error);
                Alert.alert('Error', error.message || 'Invalid verification code');
                return;
            }


            const isSuccess = data && (
                data.message === 'Success' ||
                data.success === true ||
                data.status === 'success' ||
                data.message?.toLowerCase().includes('success') ||
                typeof data === 'string' && data.toLowerCase().includes('success')
            );

            console.log('ChangePasswordModal: password changed successfully, response data:', data);

            if (isSuccess) {
                Alert.alert(
                    'Success',
                    'Password changed successfully! You will be logged out and need to login with your new password.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                handleClose();
                                if (onLogout) {
                                    onLogout();
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', 'Unexpected response from server. Please try again.');
            }
        } catch (err: any) {
            console.error('ChangePasswordModal: verifyPasswordChange exception', err);
            Alert.alert('Error', err?.message || 'Failed to verify code');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPasswordStep = () => (
        <>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.description}>
                Enter your new password below. A verification code will be sent to your email.
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="New Password"
                    secureTextEntry={isPasswordSecure}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={isPasswordSecure ? "visibility-off" : "visibility"}
                        size={scale(20)}
                        color={colors.placeholder}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm New Password"
                    secureTextEntry={isConfirmPasswordSecure}
                    style={styles.input}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={isConfirmPasswordSecure ? "visibility-off" : "visibility"}
                        size={scale(20)}
                        color={colors.placeholder}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    onPress={handleClose}
                    disabled={isLoading}
                    style={styles.cancelButton}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handlePasswordSubmit}
                    disabled={isLoading}
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                >
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={colors.white}
                            style={styles.loadingIndicator}
                        />
                    )}
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'Sending...' : 'Send Code'}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const handleResendCode = async () => {
        setIsLoading(true);
        try {
            console.log('ChangePasswordModal: resending verification code');
            const { data, error } = await userService.changePassword(userEmail, password, confirmPassword);
            console.log('ChangePasswordModal: resend response', { data, error });

            if (error) {
                Alert.alert('Error', error.message || 'Failed to resend verification code');
                return;
            }

            Alert.alert('Success', 'Verification code resent to your email.');
        } catch (err: any) {
            console.error('ChangePasswordModal: resend exception', err);
            Alert.alert('Error', err?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const renderOtpStep = () => (
        <>
            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.description}>
                Enter the 6-digit verification code sent to your email: {userEmail}
            </Text>

            <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextInput
                        key={index}
                        value={otpCode[index] || ''}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        placeholder=""
                        keyboardType="numeric"
                        maxLength={1}
                        style={[
                            styles.otpSquare,
                            otpCode[index] && styles.otpSquareFilled
                        ]}
                        textAlign="center"
                        ref={(ref) => { otpInputRefs.current[index] = ref; }}
                        selectTextOnFocus
                    />
                ))}
            </View>

            <TouchableOpacity
                onPress={handleResendCode}
                disabled={isLoading}
                style={styles.resendButton}
            >
                <Text style={styles.resendButtonText}>
                    Didn't receive code? Resend
                </Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    onPress={() => {
                        setOtpCode('');
                        setStep('password');
                    }}
                    disabled={isLoading}
                    style={styles.cancelButton}
                >
                    <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleOtpSubmit}
                    disabled={isLoading}
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                >
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={colors.white}
                            style={styles.loadingIndicator}
                        />
                    )}
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {step === 'password' ? renderPasswordStep() : renderOtpStep()}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: scale(16),
        padding: scale(24),
        width: "90%",
        maxWidth: scale(400),
    },
    title: {
        fontSize: scale(20),
        fontWeight: "700",
        color: colors.primary,
        marginBottom: verticalScale(8),
        textAlign: "center",
    },
    description: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginBottom: verticalScale(24),
        textAlign: "center",
        lineHeight: scale(20),
    },
    inputContainer: {
        position: "relative",
        marginBottom: verticalScale(16),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: scale(8),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        paddingRight: scale(50),
        fontSize: scale(14),
        color: colors.primary,
        minHeight: verticalScale(44),
    },
    eyeIcon: {
        position: "absolute",
        right: scale(16),
        top: verticalScale(12),
        padding: scale(4),
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: verticalScale(24),
        paddingHorizontal: scale(4),
    },
    otpSquare: {
        width: scale(48),
        height: scale(48),
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: scale(12),
        fontSize: scale(20),
        color: colors.primary,
        fontWeight: "700",
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    otpSquareFilled: {
        borderColor: colors.morentBlue,
        backgroundColor: colors.background,
        borderWidth: 2,
    },
    buttonRow: {
        flexDirection: "row",
        gap: scale(12),
        marginTop: verticalScale(8),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.morentBlue,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.morentBlue,
    },
    submitButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        backgroundColor: colors.morentBlue,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    submitButtonText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.white,
    },
    loadingIndicator: {
        marginRight: scale(8),
    },
    resendButton: {
        alignItems: "center",
        marginBottom: verticalScale(16),
        padding: scale(8),
    },
    resendButtonText: {
        fontSize: scale(14),
        color: colors.morentBlue,
        textDecorationLine: "underline",
    },
});