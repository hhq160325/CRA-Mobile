import React, { useState } from 'react';
import { Image, ScrollView, Text, View, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import assets from '../../assets';
import Button from '../../components/button/component';
import CheckBoxComponent from '../../components/checkbox/component';
import InputComponent from '../../components/input/component';
import { scale } from '../../theme/scale';
import { createStyles } from './signin.styles';
import { useSignin } from './signin.hook';
import { useAuth } from '../../../lib/auth-context';
import { navigate } from '../../navigators/navigation-utilities';
import { renderMarginBottom } from '../../utils/ui-utils';

const SignInScreen = () => {
  const styles = createStyles();
  const { isSecure, setIsSecure } = useSignin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);

    console.log('mobile sign in attempt', email, password);
    try {
      const success = await login(email, password);
    
      console.log('mobile login result success', success);
      if (success) {
      
        try {
          const { navigationRef } = require('../../navigators/navigation-utilities');
          if (navigationRef && navigationRef.reset) {
            navigationRef.reset({
              index: 0,
              routes: [
                {
                  name: 'tabStack',
                },
              ],
            });
          }
        } catch (e) {
       
          console.log('reset after login failed', e);
        }
      } else {
       
        Alert.alert('Login failed', 'Invalid credentials');
      }
    } catch (err: any) {
    
      console.log('login exception', err);
      Alert.alert('Login error', err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  const { logo_black } = assets;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.flexRow}>
        <Image source={logo_black} style={styles.carLogo} />
        <Text style={styles.titleStyle}>MORENT</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>Welcome Back</Text>
        <Text style={styles.textStyle}>Ready to hit the road.</Text>
      </View>
      <View style={styles.inputContainer}>
        <InputComponent
          onChangeText={e => setEmail(e)}
          placeholder={'Email/Phone Number'}
        />

        <InputComponent
          isSecure
          secureTextEntry={isSecure}
          onChangeText={e => setPassword(e)}
          placeholder={'Password'}
          onSecurePress={() => setIsSecure(!isSecure)}
        />
      </View>
      <View style={[styles.colG2]}>
        <View style={styles.flexRow}>
          <CheckBoxComponent
            onPress={e => {
              console.log('item', e);
            }}
            isChecked={false}
          />
          <Text style={styles.textRemember}>Remember Me</Text>
        </View>
        <Text style={styles.textRemember}>Forgot Password</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          text={isLoading ? 'Signing in...' : 'Login'}
          textStyles={styles.buttonText}
          onPress={handleLogin}
          buttonStyles={isLoading ? { opacity: 0.7 } : undefined}
        />
        <Button
          onPress={() => navigate('SignUpScreen')}
          text="Sign Up"
          textStyles={styles.outlineButtonSignUpText}
          buttonStyles={styles.outlineButton}
        />
      </View>
      <View style={styles.borderContainer}>
        <View style={styles.orBorder} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.orBorder} />
      </View>
      <View style={[styles.buttonContainer, styles.mt14]}>
        <Button
          text="Apple Pay"
          textStyles={styles.outlineButtonText}
          buttonStyles={styles.iconButtonStyle}
          component={<MaterialIcons name="apple" size={scale(26)} />}
        />
        <Button
          text="Google Pay"
          textStyles={styles.outlineButtonText}
          buttonStyles={styles.iconButtonStyle}
          component={<AntDesign name="google" size={scale(20)} />}
        />
      </View>
      <View style={styles.haveAccountContainer}>
        <Text style={styles.dontHaveText}>
          Don't have an account ? {'\t'}
          <Text style={styles.dontHaveText}>Sign Up</Text>
        </Text>
      </View>
      {renderMarginBottom(26)}
    </ScrollView>
  );
};

export default SignInScreen;
