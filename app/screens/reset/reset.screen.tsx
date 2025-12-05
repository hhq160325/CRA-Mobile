import React, { useState } from 'react';
import { Image, Text, View, Alert, ActivityIndicator } from 'react-native';
import assets from '../../assets';
import { createStyles } from './reset.styles';
import { renderMarginBottom, renderMarginTop } from '../../utils/ui-utils';
import InputComponent from '../../components/input/component';
import Button from '../../components/button/component';
import { navigate } from '../../navigators/navigation-utilities';
import { userService } from '../../../lib/api';
import { validateEmail } from '../singin/signin.validation';

const ResetScreen = () => {
  const styles = createStyles();
  const { logo_black } = assets;
  const [step, setStep] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Invalid Email', emailValidation.error || 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      console.log('Checking if email exists:', email);

      // Find user by email from GetAllUsers API
      const { data: user, error } = await userService.findUserByEmail(email);

      if (error || !user) {
        console.error('Email check error:', error);
        Alert.alert('Error', 'This email is not registered in our system');
      } else {
        console.log('Email exists, user found:', {
          email: user.email,
          phone: user.phoneNumber,
        });

        // Mask the phone number (e.g., 0931234519 -> 093*****19)
        const masked = userService.maskPhoneNumber(user.phoneNumber);
        setMaskedPhone(masked);

        console.log('Masked phone:', masked);

        // Move to phone verification step
        setStep('phone');
      }
    } catch (err: any) {
      console.error('Email check exception:', err);
      Alert.alert('Error', 'Unable to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Phone validation
    const cleanPhone = phone.replace(/[\s-]/g, '');

    if (cleanPhone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    if (!cleanPhone.startsWith('0')) {
      Alert.alert('Error', 'Phone number must start with 0');
      return;
    }

    if (!/^\d+$/.test(cleanPhone)) {
      Alert.alert('Error', 'Phone number must contain only digits');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying phone number:', cleanPhone);

      // Get user again to verify phone matches
      const { data: user, error } = await userService.findUserByEmail(email);

      if (error || !user) {
        console.error('User not found');
        Alert.alert('Error', 'Unable to verify phone number. Please try again.');
        return;
      }

      // Check if phone matches
      if (user.phoneNumber !== cleanPhone) {
        console.error('Phone mismatch:', {
          entered: cleanPhone,
          expected: user.phoneNumber,
        });
        Alert.alert('Error', 'Phone number does not match our records. Please try again.');
      } else {
        console.log('Phone verified successfully');

        // Navigate to OTP screen to enter verification code
        Alert.alert(
          'Success',
          'Phone number verified! A verification code will be sent to your email.',
          [
            {
              text: 'OK',
              onPress: () => navigate('OtpScreen', { email, phone: cleanPhone, type: 'reset' } as any),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('Phone verification exception:', err);
      Alert.alert('Error', err.message || 'Unable to verify phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flex}>
        <View style={styles.flexRow}>
          <Image source={logo_black} style={styles.carLogo} />
          <Text style={styles.titleStyle}>MORENT</Text>
        </View>
        <View style={styles.main}>
          <View style={styles.textContainer}>
            <Text style={[styles.textStyle, styles.textCenter]}>
              Reset your password
            </Text>
            {renderMarginTop(12)}
            {step === 'email' ? (
              <>
                <Text style={styles.infoText}>
                  Enter your Gmail address to reset your password
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoText}>
                  To verify your identity, please enter your phone number
                </Text>
                {maskedPhone && (
                  <>
                    {renderMarginTop(8)}
                    <Text style={[styles.infoText, { fontWeight: 'bold' }]}>
                      Hint: {maskedPhone}
                    </Text>
                  </>
                )}
              </>
            )}
          </View>
          <View style={styles.inputContainer}>
            {step === 'email' ? (
              <InputComponent
                onChangeText={setEmail}
                placeholder={'Email address'}
              />
            ) : (
              <>
                <View style={{ opacity: 0.6 }}>
                  <InputComponent
                    onChangeText={() => { }}
                    placeholder={email}
                  />
                </View>
                <InputComponent
                  onChangeText={setPhone}
                  placeholder={'Phone Number (10 digits)'}
                />
              </>
            )}
          </View>
          {renderMarginTop(28)}
          <Button
            onPress={step === 'email' ? handleEmailSubmit : handlePhoneSubmit}
            text={loading ? 'Verifying...' : 'Continue'}
            textStyles={styles.buttonText}
            buttonStyles={loading ? { opacity: 0.7 } : undefined}
          />
          {loading && renderMarginTop(12)}
          {loading && (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="small" />
            </View>
          )}
          {renderMarginTop(28)}
          {step === 'phone' && (
            <Text
              onPress={() => {
                setStep('email');
                setPhone('');
                setMaskedPhone('');
              }}
              style={[styles.dontHaveText, styles.textCenter]}>
              Back to email
            </Text>
          )}
          {renderMarginTop(12)}
          <Text
            onPress={() => navigate('SignInScreen')}
            style={[styles.dontHaveText, styles.textCenter]}>
            Return to sign in
          </Text>
        </View>
      </View>
      <Text onPress={() => navigate('SignUpScreen')} style={[styles.dontHaveText, styles.textCenter]}>
        Create a New account{' '}
      </Text>
      {renderMarginBottom(32)}
    </View>
  );
};

export default ResetScreen;
