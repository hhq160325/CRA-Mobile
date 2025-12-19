import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import InputComponent from '../../../components/input/component';
import Button from '../../../components/button/component';
import { renderMarginTop } from '../../../utils/ui-utils';
import { validateEmail } from '../../singin/signin.validation';

interface SignupStep2Props {
    onNext: (data: { email: string; fullName: string }) => void;
    onBack: () => void;
    styles: any;
    isLoading?: boolean;
    initialData?: {
        email: string;
        fullName: string;
    };
}

export default function SignupStep2({ onNext, onBack, styles, isLoading = false, initialData }: SignupStep2Props) {
    const [email, setEmail] = useState(initialData?.email || '');
    const [fullName, setFullName] = useState(initialData?.fullName || '');

    const validateStep2 = () => {
        if (!fullName.trim()) {
            Alert.alert('Validation Error', 'Please enter your full name');
            return false;
        }

        if (fullName.trim().length < 2) {
            Alert.alert('Invalid Name', 'Full name must be at least 2 characters');
            return false;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            Alert.alert(
                'Invalid Email',
                emailValidation.error || 'Please enter a valid email',
            );
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep2()) {
            onNext({ email, fullName });
        }
    };

    return (
        <>
            <View style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.textCenter]}>Personal Information</Text>
                <Text style={[styles.stepIndicator, styles.textCenter]}>Step 2 of 4</Text>
            </View>

            <View style={styles.inputContainer}>
                <InputComponent
                    onChangeText={setFullName}
                    value={fullName}
                    placeholder={'Full Name'}
                />

                <InputComponent
                    onChangeText={setEmail}
                    value={email}
                    placeholder={'Email Address'}
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📧 We'll send a verification code to your email address
                </Text>
                <Text style={styles.infoText}>
                    👤 Your full name will be displayed on your profile
                </Text>
            </View>

            {renderMarginTop(24)}
            <View style={styles.buttonContainer}>
                <Button
                    text={isLoading ? "Checking Email..." : "Next"}
                    textStyles={styles.buttonText}
                    onPress={handleNext}
                    buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
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