import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import Button from '../../../components/button/component';
import OtpComponent, { IOtpComponentRef } from '../../../components/otp/component';
import { renderMarginTop } from '../../../utils/ui-utils';
import { navigate } from '../../../navigators/navigation-utilities';

interface SignupStep4Props {
    phone: string;
    onResendOtp: () => void;
    onVerifyOtp: (otp: string) => void;
    onBack: () => void;
    isLoading: boolean;
    styles: any;
}

export default function SignupStep4({
    phone,
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
                'A new verification code has been sent to your phone. Please check your messages.',
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

    const maskPhone = (phone: string) => {
        if (!phone) return '****';
        // Remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 4) return '****';

        // Show first 2 and last 2 digits, mask the middle
        const firstTwo = cleanPhone.substring(0, 2);
        const lastTwo = cleanPhone.substring(cleanPhone.length - 2);
        const middleLength = cleanPhone.length - 4;
        const masked = '*'.repeat(Math.max(middleLength, 2));

        return `${firstTwo}${masked}${lastTwo}`;
    };

    return (
        <>
            <View style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.textCenter]}>Verify Your Phone</Text>
                <Text style={[styles.stepIndicator, styles.textCenter]}>Step 4 of 4</Text>
                {renderMarginTop(12)}
                <Text style={[styles.dontHaveText, styles.textCenter]}>
                    We've sent a verification code to:
                </Text>
                <Text style={[styles.dontHaveText, styles.textCenter, { fontWeight: 'bold', color: 'blue' }]}>
                    {maskPhone(phone)}
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <OtpComponent ref={otpRef} onOTPChange={setOtp} />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📱 Check your phone messages
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