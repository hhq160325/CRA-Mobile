import { useState, useEffect, useRef } from 'react';
import { Image, ScrollView, Text, View, Alert } from 'react-native';
import assets from '../../assets';
import Button from '../../components/button/component';
import InputComponent from '../../components/input/component';
import OtpComponent, { IOtpComponentRef } from '../../components/otp/component';
import { goBack, navigate } from '../../navigators/navigation-utilities';
import { renderMarginTop } from '../../utils/ui-utils';
import { useSignup } from './signup.hook';
import { createStyles } from './signup.styles';
import { authService } from '../../../lib/api';
import { validateEmail } from '../singin/signin.validation';

const SignUpScreen = () => {
  const styles = createStyles();
  const { isSecure, setIsSecure } = useSignup();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP verification states
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [signupData, setSignupData] = useState<any>(null);

  // Resend OTP states
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const otpRef = useRef<IOtpComponentRef>(null);

  // Phone number validation function
  const validatePhoneNumber = (phoneNumber: string): { valid: boolean; error?: string } => {
    if (!phoneNumber.trim()) {
      return { valid: true };
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

  const validateSignupData = () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return false;
    }
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
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


    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      Alert.alert('Invalid Phone Number', phoneValidation.error || 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateSignupData()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== Starting Signup ===');
      console.log('Signup data:', {
        username,
        fullname: fullName,
        email,
        phone,
        address,
      });


      const cleanPhone = phone.replace(/\D/g, '');
      const userData = {
        username: username,
        fullname: fullName,
        email: email,
        password: password,
        phoneNumber: cleanPhone || undefined,
        address: address || undefined,
        gender: 0,
      };
      setSignupData(userData);


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

        Alert.alert(
          'Sign Up Failed',
          statusCode ? `${errorMessage} (Error ${statusCode})` : errorMessage,
        );
      } else {
        console.log('✅ Signup API called successfully, OTP sent to email');
        setShowOtpStep(true);
        startResendCountdown();
        Alert.alert(
          'Check Your Email',
          'We\'ve sent a verification code to your email. Please check your email and enter the code below.',
        );
      }
    } catch (error: any) {
      console.error('Signup exception:', error);
      Alert.alert('Sign Up Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== Verifying OTP ===');


      const verifyResult = await authService.verifySignupOtp(email, otp);

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
    if (!canResend || isResending) {
      return;
    }

    if (!signupData) {
      Alert.alert('Error', 'Signup data not found. Please go back and try again.');
      return;
    }

    setIsResending(true);
    try {
      console.log('=== Resending OTP ===');


      setOtp('');
      otpRef.current?.clear();


      const result = await authService.register(signupData);

      if (result.error) {
        console.error('Resend OTP error:', result.error);
        Alert.alert(
          'Error',
          result.error.message || 'Failed to resend verification code',
        );
      } else {
        console.log('✅ OTP resent successfully');
        startResendCountdown();

        Alert.alert(
          'Code Resent',
          'A new verification code has been sent to your email. Please check your inbox.',
        );
      }
    } catch (error: any) {
      console.error('Resend OTP exception:', error);
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setIsResending(false);
    }
  };


  useEffect(() => {
    if (resendCountdown > 0) {
      countdownInterval.current = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (resendCountdown === 0 && showOtpStep) {
      setCanResend(true);
    }

    return () => {
      if (countdownInterval.current) {
        clearTimeout(countdownInterval.current);
      }
    };
  }, [resendCountdown, showOtpStep]);


  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearTimeout(countdownInterval.current);
      }
    };
  }, []);

  const startResendCountdown = () => {
    setResendCountdown(60);
    setCanResend(false);
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

  const { logo_black } = assets;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        <Image source={logo_black} style={styles.carLogo} />
        <Text style={[styles.titleStyle, { color: 'blue' }]}>MORENT</Text>
      </View>

      {!showOtpStep ? (
        // Signup Form
        <>
          <View style={styles.textContainer}>
            <Text style={[styles.textStyle, styles.textCenter]}>Sign Up</Text>
          </View>
          <View style={styles.inputContainer}>
            <InputComponent onChangeText={setUsername} placeholder={'Username'} />
            <InputComponent onChangeText={setFullName} placeholder={'Full Name'} />
            <InputComponent onChangeText={setEmail} placeholder={'Email Address'} />
            <InputComponent
              isSecure
              secureTextEntry={isSecure}
              onChangeText={setPassword}
              placeholder={'Password'}
              onSecurePress={() => setIsSecure(!isSecure)}
            />
            <InputComponent
              onChangeText={handlePhoneChange}
              value={phone}
              placeholder={'Phone Number '}
              keyboardType="numeric"
              maxLength={12}
            />
            <InputComponent
              onChangeText={setAddress}
              placeholder={'Address'}
            />
          </View>
          {renderMarginTop(12)}
          <View style={styles.buttonContainer}>
            <Button
              text={isLoading ? 'Sending Code...' : 'Sign Up'}
              textStyles={styles.buttonText}
              onPress={handleSignUp}
              buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
            />
            <Button
              onPress={goBack}
              text="Login"
              textStyles={styles.outlineButtonSignUpText}
              buttonStyles={styles.outlineButton}
            />
          </View>

          <View style={styles.haveAccountContainer}>
            <Text style={styles.dontHaveText}>
              Already have an account? {'\t'}
              <Text onPress={goBack} style={[styles.dontHaveText, { color: 'blue' }]}>
                Login
              </Text>
            </Text>
          </View>
        </>
      ) : (
        // OTP Verification Step
        <>
          <View style={styles.textContainer}>
            <Text style={[styles.textStyle, styles.textCenter]}>Verify Your Email</Text>
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

          {renderMarginTop(28)}
          <View style={styles.buttonContainer}>
            <Button
              text={isLoading ? 'Verifying...' : 'Verify Code'}
              textStyles={styles.buttonText}
              onPress={handleVerifyOtp}
              buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
            />
            <Button
              onPress={() => {
                setShowOtpStep(false);
                setOtp('');
                setResendCountdown(0);
                setCanResend(false);
                if (countdownInterval.current) {
                  clearTimeout(countdownInterval.current);
                }
              }}
              text="Back to Form"
              textStyles={styles.outlineButtonSignUpText}
              buttonStyles={styles.outlineButton}
            />
          </View>

          {renderMarginTop(28)}
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
        </>
      )}
    </ScrollView>
  );
};

export default SignUpScreen;
