import React from 'react';
import {Image, ImageBackground, Text, View} from 'react-native';
import assets from '../../assets';
import Button from '../../components/button/component';
import {createStyles} from './onboarding.styles';
import {navigate} from '../../navigators/navigation-utilities';
import {useAuth} from '@/lib/auth-context';

const OnBoardingScreen = () => {
  const styles = createStyles();
  const {logo, overlayBg, whiteCar} = assets;
  const {isAuthenticated} = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
    
      navigate('tabStack' as any);
    } else {
 
      navigate('OnBoardingScreenTwo');
    }
  };

  return (
    <ImageBackground
      resizeMode="cover"
      source={whiteCar}
      style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        source={overlayBg}
        style={styles.overLay}>
        <View>
          <View style={styles.logoContainer}>
            <Image resizeMode="contain" source={logo} style={styles.carLogo} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.title}>MORENT</Text>
          </View>
        </View>
        <Button
          onPress={handleGetStarted}
          text="Get Started"
          buttonStyles={styles.buttonStyle}
          textStyles={styles.buttonText}
        />
      </ImageBackground>
    </ImageBackground>
  );
};

export default OnBoardingScreen;
