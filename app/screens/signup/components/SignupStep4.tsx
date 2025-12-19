import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import Button from '../../../components/button/component';
import OtpComponent, { IOtpComponentRef } from '../../../components/otp/component';
import { renderMarginTop } from '../../../utils/ui-utils';
import { navigate } from '../../../navigators/navigation-utilities';

interface SignupStep4Props {
    email: string;
    onResendOtp: () => void;
    onVerifyOtp: (otp: string) => void;
    onBack: () => void;
    isLoading: boolean;
    styles: any;
}

export default function SignupStep4({
    email,
    onResendOtp,
    onVerifyOtp,
    onBack,
    isLoading,
    styles
}: SignupStep4Props) {
    const [otp, setOtp] = useState('');
    const [resendCountdown, setResendCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);
    const otpRef = useRef<IOtpComponentRef>(null);

    useEffect(() => {
        if (resendCountdown > 0) {
            countdownInterval.current = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
        } else if (resendCountdown === 0) {
            setCanResend(true);
        }

        return () => {
            if (countdownInterval.current) {
                clearTimeout(countdownInterval.current);
            }
        };
    }, [resendCountdown]);

    useEffect(() => {
        return () => {
            if (countdownInterval.current) {
                clearTimeout(countdownInterval.current);
            }
        };
    }, []);

    const handleVerifyOtp = () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit verification code');
            return;
        }
        onVerifyOtp(otp);
    };

    const handleResendOtp = async () => {
        if (!canResend || isResending) {
            return;
        }

        setIsResending(true);
        setOtp('');
        otpRef.current?.clear();

        try {
            await onResendOtp();
            setResendCountdown(60);
            setCanResend(false);
            Alert.alert(
                'Code Resent',
                'A new verification code has been sent to your email. Please check your inbox.',
            );
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsResending(false);
        }
    };

    const formatCountdown = (seconds: number): string => {
        if (seconds >= 60) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${seconds}s`;
    };

    const maskEmail = (email: string) => {
        if (!email) return '****@****.com';
        const [username, domain] = email.split('@');
        const maskedUsername = username.substring(0, 2) + '****';
        return `${maskedUsername}@${domain}`;
    };

    return (
        <>
            <View style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.textCenter]}>Verify Your Email</Text>
                <Text style={[styles.stepIndicator, styles.textCenter]}>Step 4 of 4</Text>
                {renderMarginTop(12)}
                <Text style={[styles.dontHaveText, styles.textCenter]}>
                    We've sent a verification code to:
                </Text>
                <Text style={[styles.dontHaveText, styles.textCenter, { fontWeight: 'bold', color: 'blue' }]}>
                    {maskEmail(email)}
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <OtpComponent ref={otpRef} onOTPChange={setOtp} />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📧 Check your email inbox and spam folder
                </Text>
                <Text style={styles.infoText}>
                    🔢 Enter the 6-digit code to complete registration
                </Text>
            </View>

            {renderMarginTop(24)}
            <View style={styles.buttonContainer}>
                <Button
                    text={isLoading ? 'Verifying...' : 'Verify & Complete'}
                    textStyles={styles.buttonText}
                    onPress={handleVerifyOtp}
                    buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
                />
                <Button
                    onPress={onBack}
                    text="Back"
                    textStyles={styles.outlineButtonSignUpText}
                    buttonStyles={styles.outlineButton}
                />
            </View>

            {renderMarginTop(20)}
            <View style={styles.haveAccountContainer}>
                <Text style={[styles.dontHaveText, styles.textCenter]}>
                    Didn't receive the code? {'\t'}
                    {canResend ? (
                        <Text
                            onPress={handleResendOtp}
                            style={[
                                styles.dontHaveText,
                                {
                                    color: isResending ? '#999' : 'blue',
                                    fontWeight: 'bold',
                                    opacity: isResending ? 0.6 : 1
                                }
                            ]}
                        >
                            {isResending ? 'Sending...' : 'Resend'}
                        </Text>
                    ) : (
                        <Text style={[styles.dontHaveText, { color: '#999' }]}>
                            Resend in {formatCountdown(resendCountdown)}
                        </Text>
                    )}
                </Text>
            </View>

            {renderMarginTop(20)}
            <View style={styles.haveAccountContainer}>
                <Text style={styles.dontHaveText}>
                    Already have an account? {'\t'}
                    <Text onPress={() => navigate('SignInScreen')} style={[styles.dontHaveText, { color: 'blue' }]}>
                        Login
                    </Text>
                </Text>
            </View>
        </>
    );
}