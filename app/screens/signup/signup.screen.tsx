import {useState} from 'react';
import {Image, ScrollView, Text, View, Alert} from 'react-native';
import assets from '../../assets';
import Button from '../../components/button/component';
import InputComponent from '../../components/input/component';
import {goBack, navigate} from '../../navigators/navigation-utilities';
import {renderMarginTop} from '../../utils/ui-utils';
import {useSignup} from './signup.hook';
import {createStyles} from './signup.styles';
import {authService} from '../../../lib/api';
import {validateEmail} from '../singin/signin.validation';

const SignUpScreen = () => {
  const styles = createStyles();
  const {isSecure, setIsSecure} = useSignup();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert(
        'Invalid Email',
        emailValidation.error || 'Please enter a valid email',
      );
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters');
      return;
    }

    if (!/[a-zA-Z]/.test(password)) {
      Alert.alert('Weak Password', 'Password must contain at least one letter');
      return;
    }

    if (!/\d/.test(password)) {
      Alert.alert('Weak Password', 'Password must contain at least one number');
      return;
    }

    if (!/[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least one uppercase letter or special character (!@#$%^&*)',
      );
      return;
    }

    if (phone.trim()) {
      const cleanPhone = phone.replace(/[\s-]/g, '');

      if (cleanPhone.length !== 10) {
        Alert.alert(
          'Validation Error',
          'Phone number must be exactly 10 digits',
        );
        return;
      }

      if (!cleanPhone.startsWith('0')) {
        Alert.alert('Validation Error', 'Phone number must start with 0');
        return;
      }

      if (!/^\d+$/.test(cleanPhone)) {
        Alert.alert(
          'Validation Error',
          'Phone number must contain only digits',
        );
        return;
      }
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

      const result = await authService.register({
        username: username,
        fullname: fullName,
        email: email,
        password: password,
        phoneNumber: phone || undefined,
        address: address || undefined,
        gender: 2,
      });

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
        console.log('✅ Signup successful:', result.data);
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
      console.error('Signup exception:', error);
      Alert.alert('Sign Up Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const {logo_black} = assets;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        <Image source={logo_black} style={styles.carLogo} />
        <Text style={[styles.titleStyle, {color: 'blue'}]}>MORENT</Text>
      </View>
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
          onChangeText={setPhone}
          placeholder={'Phone Number (Optional)'}
        />
        <InputComponent
          onChangeText={setAddress}
          placeholder={'Address (Optional)'}
        />
      </View>
      {renderMarginTop(12)}
      <View style={styles.buttonContainer}>
        <Button
          text={isLoading ? 'Creating Account...' : 'Sign Up'}
          textStyles={styles.buttonText}
          onPress={handleSignUp}
          buttonStyles={isLoading ? {opacity: 0.7} : undefined}
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
          <Text onPress={goBack} style={[styles.dontHaveText, {color: 'blue'}]}>
            Login
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;
