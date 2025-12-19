import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import InputComponent from '../../../components/input/component';
import Button from '../../../components/button/component';
import { renderMarginTop } from '../../../utils/ui-utils';

interface SignupStep1Props {
    onNext: (data: { username: string; password: string }) => void;
    onBack: () => void;
    styles: any;
    isLoading?: boolean;
    initialData?: {
        username: string;
        password: string;
    };
}

export default function SignupStep1({ onNext, onBack, styles, isLoading = false, initialData }: SignupStep1Props) {
    const [username, setUsername] = useState(initialData?.username || '');
    const [password, setPassword] = useState(initialData?.password || '');
    const [confirmPassword, setConfirmPassword] = useState(initialData?.password || '');
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

    const validateStep1 = () => {
        if (!username.trim()) {
            Alert.alert('Validation Error', 'Please enter a username');
            return false;
        }

        if (username.length < 3) {
            Alert.alert('Invalid Username', 'Username must be at least 3 characters');
            return false;
        }

        if (!password.trim()) {
            Alert.alert('Validation Error', 'Please enter a password');
            return false;
        }

        if (password.length < 8) {
            Alert.alert('Weak Password', 'Password must be at least 8 characters');
            return false;
        }

        if (!/[a-zA-Z]/.test(password)) {
            Alert.alert('Weak Password', 'Password must contain at least one letter');
            return false;
        }

        if (!/\d/.test(password)) {
            Alert.alert('Weak Password', 'Password must contain at least one number');
            return false;
        }

        if (!/[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            Alert.alert(
                'Weak Password',
                'Password must contain at least one uppercase letter or special character (!@#$%^&*)',
            );
            return false;
        }

        if (!confirmPassword.trim()) {
            Alert.alert('Validation Error', 'Please confirm your password');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            onNext({ username, password });
        }
    };

    return (
        <>
            <View style={styles.textContainer}>
                <Text style={[styles.textStyle, styles.textCenter]}>Create Account</Text>
                <Text style={[styles.stepIndicator, styles.textCenter]}>Step 1 of 4</Text>
            </View>

            <View style={styles.inputContainer}>
                <InputComponent
                    onChangeText={setUsername}
                    value={username}
                    placeholder={'Username'}
                />

                <InputComponent
                    isSecure
                    secureTextEntry={isPasswordSecure}
                    onChangeText={setPassword}
                    value={password}
                    placeholder={'Password'}
                    onSecurePress={() => setIsPasswordSecure(!isPasswordSecure)}
                />

                <InputComponent
                    isSecure
                    secureTextEntry={isConfirmPasswordSecure}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    placeholder={'Confirm Password'}
                    onSecurePress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
                />
            </View>

            <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={[styles.requirementText, password.length >= 8 && styles.requirementMet]}>
                    • At least 8 characters
                </Text>
                <Text style={[styles.requirementText, /[a-zA-Z]/.test(password) && styles.requirementMet]}>
                    • Contains letters
                </Text>
                <Text style={[styles.requirementText, /\d/.test(password) && styles.requirementMet]}>
                    • Contains numbers
                </Text>
                <Text style={[styles.requirementText, /[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && styles.requirementMet]}>
                    • Contains uppercase or special characters
                </Text>
            </View>

            {renderMarginTop(24)}
            <View style={styles.buttonContainer}>
                <Button
                    text={isLoading ? "Checking Username..." : "Next"}
                    textStyles={styles.buttonText}
                    onPress={handleNext}
                    buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
                />
                <Button
                    onPress={onBack}
                    text="Back to Login"
                    textStyles={styles.outlineButtonSignUpText}
                    buttonStyles={styles.outlineButton}
                />
            </View>
        </>
    );
}