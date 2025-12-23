import React, { useState } from 'react';
import { Image, Text, View, Alert, ActivityIndicator } from 'react-native';
import assets from '../../assets';
import { createStyles } from './reset.styles';
import { renderMarginBottom, renderMarginTop } from '../../utils/ui-utils';
import InputComponent from '../../components/input/component';
import Button from '../../components/button/component';
import { navigate } from '../../navigators/navigation-utilities';
import { userService } from '../../../lib/api';

const ResetScreen = () => {
  const styles = createStyles();
  const { logo_black } = assets;
  const [phone, setPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneVerification = async () => {
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


      const { data: users, error } = await userService.getAllUsers();

      if (error || !users) {
        console.error('Failed to get users:', error);
        Alert.alert('Error', 'Unable to verify phone number. Please try again.');
        return;
      }


      const user = users.find(u => u.phoneNumber === cleanPhone);

      if (!user) {
        console.error('Phone number not found:', cleanPhone);
        Alert.alert('Error', 'This phone number is not registered in our system');
        return;
      }

      console.log('Phone verified successfully, user found:', {
        email: user.email,
        phone: user.phoneNumber,
      });


      setUserEmail(user.email);


      Alert.alert(
        'Phone Verified',
        'Phone number verified successfully! You can now reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigate('OtpScreen', {
              email: user.email,
              phone: cleanPhone,
              type: 'reset',
              skipOtp: true
            } as any),
          },
        ]
      );
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
            <Text style={styles.infoText}>
              Enter your phone number to verify your identity and reset your password
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <InputComponent
              onChangeText={setPhone}
              placeholder={'Phone Number (10 digits)'}
              keyboardType="numeric"
            />
          </View>
          {renderMarginTop(28)}
          <Button
            onPress={handlePhoneVerification}
            text={loading ? 'Verifying...' : 'Verify Phone Number'}
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
