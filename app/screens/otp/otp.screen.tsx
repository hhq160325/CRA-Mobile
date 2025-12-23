import React, { useState } from 'react';
import {
  Image,
  Text,
  View,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import assets from '../../assets';
import Button from '../../components/button/component';
import OtpComponent from '../../components/otp/component';
import { navigate } from '../../navigators/navigation-utilities';
import { renderMarginTop } from '../../utils/ui-utils';
import { createStyles } from './otp.styles';
import { authService } from '../../../lib/api';
import { useRoute } from '@react-navigation/native';

const OtpScreen = () => {
  const styles = createStyles();
  const { logo_black } = assets;
  const route = useRoute();
  const params = route.params as any;

  const email = params?.email || '';
  const type = params?.type || 'verify';
  const skipOtp = params?.skipOtp || false;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(skipOtp);

  const maskEmail = (email: string) => {
    if (!email) return '****@****.com';
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '****';
    return `${maskedUsername}@${domain}`;
  };

  const handleVerifyCode = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.verifyResetCode(email, otp);

      if (error) {
        Alert.alert('Error', 'Invalid verification code');
      } else if (data?.valid) {
        if (type === 'reset') {
          setShowPasswordFields(true);
        } else {
          Alert.alert('Success', 'Verification successful!', [
            { text: 'OK', onPress: () => navigate('SignInScreen') },
          ]);
        }
      } else {
        Alert.alert('Error', 'Invalid verification code');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {

      const resetCode = skipOtp ? 'PHONE_VERIFIED' : otp;

      const { data, error } = await authService.resetPassword(
        email,
        resetCode,
        newPassword,
      );

      if (error) {
        Alert.alert('Error', error.message || 'Failed to reset password');
      } else {
        Alert.alert('Success', 'Your password has been reset successfully!', [
          {
            text: 'OK',
            onPress: () => navigate('SignInScreen'),
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authService.forgotPassword(email);

      if (error) {
        Alert.alert('Error', 'Failed to resend code');
      } else {
        Alert.alert(
          'Success',
          'Verification code has been resent to your email',
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend code');
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
              {showPasswordFields
                ? 'Create New Password'
                : 'Enter verification code'}
            </Text>
            {renderMarginTop(12)}
            {!showPasswordFields && !skipOtp && (
              <Text style={styles.infoText}>
                We have sent a code to: {maskEmail(email)}
              </Text>
            )}
            {skipOtp && showPasswordFields && (
              <Text style={styles.infoText}>
                Phone number verified. Please enter your new password.
              </Text>
            )}
          </View>

          {!showPasswordFields ? (
            <>
              <View style={styles.inputContainer}>
                <OtpComponent onOTPChange={setOtp} />
              </View>
              {renderMarginTop(28)}
              <Button
                onPress={handleVerifyCode}
                text={loading ? 'Verifying...' : 'Continue'}
                textStyles={styles.buttonText}
                disabled={loading}
              />
              {renderMarginTop(28)}
              <Text
                onPress={handleResend}
                style={[styles.dontHaveText, styles.textCenter]}>
                Didn't receive the OTP?{' '}
                <Text style={{ fontWeight: 'bold' }}>Resend</Text>
              </Text>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 12,
                  }}
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
              {renderMarginTop(28)}
              <Button
                onPress={handleResetPassword}
                text={loading ? 'Resetting...' : 'Reset Password'}
                textStyles={styles.buttonText}
                disabled={loading}
              />
            </>
          )}

          {loading && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default OtpScreen;
