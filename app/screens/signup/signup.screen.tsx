import { useState } from 'react';
import { Image, ScrollView, Text, View, Alert } from 'react-native';
import assets from '../../assets';
import { goBack, navigate } from '../../navigators/navigation-utilities';
import { createStyles } from './signup.styles';
import { authService, userService } from '../../../lib/api';
import ProgressIndicator from './components/ProgressIndicator';
import SignupStep1 from './components/SignupStep1';
import SignupStep2 from './components/SignupStep2';
import SignupStep3 from './components/SignupStep3';
import SignupStep4 from './components/SignupStep4';

const SignUpScreen = () => {
  const styles = createStyles();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
  });

  // Step handlers
  const handleStep1Next = async (data: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(data.username);

      if (usernameExists) {
        Alert.alert(
          'Username Already Taken',
          `The username "${data.username}" is already taken. Please choose a different username.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setFormData(prev => ({ ...prev, ...data }));
      setCurrentStep(2);
    } catch (error) {
      console.error('Error validating username:', error);
      Alert.alert('Validation Error', 'Could not validate username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = async (data: { email: string; fullName: string }) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        Alert.alert(
          'Email Already Registered',
          `The email "${data.email}" is already registered. Please use a different email address or try signing in instead.`,
          [
            {
              text: 'Sign In Instead',
              onPress: () => navigate('SignInScreen'),
            },
            {
              text: 'Use Different Email',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      setFormData(prev => ({ ...prev, ...data }));
      setCurrentStep(3);
    } catch (error) {
      console.error('Error validating email:', error);
      Alert.alert('Validation Error', 'Could not validate email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Next = (data: { phone: string; address: string }) => {
    const completeFormData = { ...formData, ...data };
    setFormData(completeFormData);
    handleSignUp(completeFormData);
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      goBack();
    }
  };

  // Check if email already exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // console.log('🔍 Checking if email exists:', email);
      const result = await userService.findUserByEmail(email);

      if (result.data) {
        // console.log('❌ Email already exists:', email);
        return true;
      }

      // console.log('✅ Email is available:', email);
      return false;
    } catch (error) {
      // console.log('✅ Email is available (not found):', email);
      return false;
    }
  };

  // Check if username already exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    try {
      // console.log('🔍 Checking if username exists:', username);
      const result = await userService.getAllUsers();

      if (result.error || !result.data) {
        // console.log('⚠️ Could not check username, allowing signup');
        return false;
      }

      const existingUser = result.data.find(
        user => user.username.toLowerCase() === username.toLowerCase()
      );

      if (existingUser) {
        // console.log('❌ Username already exists:', username);
        return true;
      }

      // console.log('✅ Username is available:', username);
      return false;
    } catch (error) {
      // console.log('⚠️ Error checking username, allowing signup:', error);
      return false;
    }
  };

  const handleSignUp = async (data: typeof formData) => {
    setIsLoading(true);
    try {
      console.log('=== Starting Signup ===');
      console.log('Signup data:', data);

      const cleanPhone = data.phone.replace(/\D/g, '');
      const userData = {
        username: data.username,
        fullname: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: cleanPhone || undefined,
        address: data.address || undefined,
        gender: 0,
      };

      const result = await authService.register(userData);

      console.log('Signup result:', {
        hasError: !!result.error,
        hasData: !!result.data,
      });

      if (result.error) {
        console.error('Signup error details:', {
          message: result.error.message,
          status: (result.error as any).status,
          data: (result.error as any).data,
        });

        const errorMessage = result.error.message || 'Unable to create account';
        const statusCode = (result.error as any).status;
        const errorData = (result.error as any).data;

        // Check for specific error types
        let alertTitle = 'Sign Up Failed';
        let alertMessage = errorMessage;

        // Check if email already exists
        if (statusCode === 400 || statusCode === 409) {
          const lowerErrorMessage = errorMessage.toLowerCase();
          const lowerErrorData = JSON.stringify(errorData || {}).toLowerCase();

          if (lowerErrorMessage.includes('email') &&
            (lowerErrorMessage.includes('exist') ||
              lowerErrorMessage.includes('taken') ||
              lowerErrorMessage.includes('already') ||
              lowerErrorData.includes('email') && lowerErrorData.includes('exist'))) {

            console.error('❌ EMAIL ALREADY EXISTS ERROR:', {
              email: data.email,
              errorMessage,
              statusCode,
              errorData
            });

            alertTitle = 'Email Already Registered';
            alertMessage = `The email "${data.email}" is already registered. Please use a different email address or try signing in instead.`;
          }
          // Check if username already exists
          else if (lowerErrorMessage.includes('username') &&
            (lowerErrorMessage.includes('exist') ||
              lowerErrorMessage.includes('taken') ||
              lowerErrorMessage.includes('already') ||
              lowerErrorData.includes('username') && lowerErrorData.includes('exist'))) {

            console.error('❌ USERNAME ALREADY EXISTS ERROR:', {
              username: data.username,
              errorMessage,
              statusCode,
              errorData
            });

            alertTitle = 'Username Already Taken';
            alertMessage = `The username "${data.username}" is already taken. Please choose a different username.`;
          }
        }
        // Server error (500)
        else if (statusCode === 500) {
          console.error('❌ SERVER ERROR:', {
            errorMessage,
            statusCode,
            errorData
          });

          alertTitle = 'Server Error';
          alertMessage = 'Our servers are experiencing issues. Please try again in a few minutes or contact support if the problem persists.';
        }
        // Network or other errors
        else {
          console.error('❌ SIGNUP ERROR:', {
            errorMessage,
            statusCode,
            errorData
          });
        }

        // For email/username errors, navigate back to appropriate step
        if (alertTitle === 'Email Already Registered') {
          Alert.alert(alertTitle, alertMessage, [
            {
              text: 'Change Email',
              onPress: () => setCurrentStep(2), // Go back to Step 2 (email input)
            },
            {
              text: 'Sign In Instead',
              onPress: () => navigate('SignInScreen'),
            },
          ]);
        } else if (alertTitle === 'Username Already Taken') {
          Alert.alert(alertTitle, alertMessage, [
            {
              text: 'Change Username',
              onPress: () => setCurrentStep(1), // Go back to Step 1 (username input)
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
        } else {
          Alert.alert(alertTitle, alertMessage);
        }
      } else {
        console.log('✅ Signup API called successfully, OTP sent to email');
        setCurrentStep(4);
        Alert.alert(
          'Check Your Phone',
          'We\'ve sent a verification code to your phone. Please check your messages and enter the code below.',
        );
      }
    } catch (error: any) {
      console.error('Signup exception:', error);
      Alert.alert('Sign Up Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      console.log('=== Verifying OTP ===');

      const cleanPhone = formData.phone.replace(/\D/g, '');
      const verifyResult = await authService.verifySignupOtpByPhone(cleanPhone, otp);

      if (verifyResult.error) {
        console.error('Verify OTP error:', verifyResult.error);
        Alert.alert(
          'Invalid Code',
          verifyResult.error.message || 'Invalid verification code',
        );
      } else {
        console.log('✅ OTP verified successfully, account created');
        Alert.alert(
          'Success',
          'Account created successfully! Please sign in.',
          [
            {
              text: 'OK',
              onPress: () => navigate('SignInScreen'),
            },
          ],
        );
      }
    } catch (error: any) {
      console.error('Verify OTP exception:', error);
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      console.log('=== Resending OTP ===');

      const cleanPhone = formData.phone.replace(/\D/g, '');
      const userData = {
        username: formData.username,
        fullname: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: cleanPhone || undefined,
        address: formData.address || undefined,
        gender: 0,
      };

      const result = await authService.register(userData);

      if (result.error) {
        console.error('❌ Resend OTP error:', {
          message: result.error.message,
          status: (result.error as any).status,
          data: (result.error as any).data,
        });

        const errorMessage = result.error.message || 'Failed to resend verification code';
        Alert.alert('Resend Failed', errorMessage);
      } else {
        console.log('✅ OTP resent successfully');
      }
    } catch (error: any) {
      console.error('Resend OTP exception:', error);
      Alert.alert('Error', error?.message || 'Something went wrong');
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupStep1
            onNext={handleStep1Next}
            onBack={handleStepBack}
            styles={styles}
            isLoading={isLoading}
            initialData={{
              username: formData.username,
              password: formData.password,
            }}
          />
        );
      case 2:
        return (
          <SignupStep2
            onNext={handleStep2Next}
            onBack={handleStepBack}
            styles={styles}
            isLoading={isLoading}
            initialData={{
              email: formData.email,
              fullName: formData.fullName,
            }}
          />
        );
      case 3:
        return (
          <SignupStep3
            onNext={handleStep3Next}
            onBack={handleStepBack}
            styles={styles}
            initialData={{
              phone: formData.phone,
              address: formData.address,
            }}
          />
        );
      case 4:
        return (
          <SignupStep4
            phone={formData.phone}
            onResendOtp={handleResendOtp}
            onVerifyOtp={handleVerifyOtp}
            onBack={handleStepBack}
            isLoading={isLoading}
            styles={styles}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        <Text style={[styles.titleStyle, { color: 'blue' }]}>MORENT</Text>
      </View>

      <ProgressIndicator currentStep={currentStep} totalSteps={4} styles={styles} />

      {renderCurrentStep()}
    </ScrollView>
  );
};

export default SignUpScreen;
