import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import InputComponent from '../../../components/input/component';
import Button from '../../../components/button/component';
import { renderMarginTop } from '../../../utils/ui-utils';

interface SignupStep3Props {
    onNext: (data: { phone: string; address: string }) => void;
    onBack: () => void;
    styles: any;
    initialData?: {
        phone: string;
        address: string;
    };
}

export default function SignupStep3({ onNext, onBack, styles, initialData }: SignupStep3Props) {
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [address, setAddress] = useState(initialData?.address || '');

    // Phone number validation function
    const validatePhoneNumber = (phoneNumber: string): { valid: boolean; error?: string } => {
        if (!phoneNumber.trim()) {
            return {
                valid: false,
                error: 'Phone number is required for account verification'
            };
        }

        // Remove all non-digit characters
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        // Check if it has exactly 10 digits
        if (cleanPhone.length !== 10) {
            return {
                valid: false,
                error: 'Phone number must be exactly 10 digits'
            };
        }

        if (!cleanPhone.startsWith('0')) {
            return {
                valid: false,
                error: 'Phone number must start with 0'
            };
        }

        if (!/^\d{10}$/.test(cleanPhone)) {
            return {
                valid: false,
                error: 'Phone number must contain only digits'
            };
        }

        return { valid: true };
    };

    const formatPhoneNumber = (phoneNumber: string): string => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        if (cleanPhone.length <= 4) {
            return cleanPhone;
        } else if (cleanPhone.length <= 7) {
            return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4)}`;
        } else if (cleanPhone.length <= 10) {
            return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
        }

        return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7, 10)}`;
    };

    const handlePhoneChange = (text: string) => {
        const cleanText = text.replace(/\D/g, '');

        if (cleanText.length <= 10) {
            const formattedPhone = formatPhoneNumber(cleanText);
            setPhone(formattedPhone);
        }
    };

    const validateStep3 = () => {
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.valid) {
            Alert.alert('Invalid Phone Number', phoneValidation.error || 'Please enter a valid phone number');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep3()) {
            onNext({ phone, address });
        }
    };

    return (
        <>
            <View style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.textCenter]}>Contact Information</Text>
                <Text style={[styles.stepIndicator, styles.textCenter]}>Step 3 of 4</Text>
            </View>

            <View style={styles.inputContainer}>
                <InputComponent
                    onChangeText={handlePhoneChange}
                    value={phone}
                    placeholder={'Phone Number'}
                    keyboardType="numeric"
                    maxLength={12}
                />

                <InputComponent
                    onChangeText={setAddress}
                    value={address}
                    placeholder={'Address (Optional)'}
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📱 Phone number is required for account verification
                </Text>
                <Text style={styles.infoText}>
                    📍 Address can be used for faster car delivery
                </Text>
                {/* <Text style={[styles.infoText, styles.optionalText]}>
                    Address is optional and can be added later
                </Text> */}
            </View>

            {renderMarginTop(24)}
            <View style={styles.buttonContainer}>
                <Button
                    text="Create Account"
                    textStyles={styles.buttonText}
                    onPress={handleNext}
                />
                <Button
                    onPress={onBack}
                    text="Back"
                    textStyles={styles.outlineButtonSignUpText}
                    buttonStyles={styles.outlineButton}
                />
            </View>
        </>
    );
}