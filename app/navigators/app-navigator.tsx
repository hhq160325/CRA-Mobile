/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable eqeqeq */
import React from 'react';
import {Animated, Platform, Text, View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigatorParamList} from './navigation-route';
import {navigationRef} from './navigation-utilities';
import {useAuth} from '../../lib/auth-context';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import OnBoardingScreen from '../screens/onboarding/onboarding.screen';
import {colors} from '../theme/colors';
import {scale} from '../theme/scale';
import {createStyle} from './navigation.styles';
import OnBoardingScreenTwo from '../screens/onboarding/onboardingTwo.screen';
import HomeScreen from '../screens/home/home.screen';
import BookingsScreen from '../screens/bookings/bookings.screen';
import BookingsListScreen from '../screens/bookings/bookings-list.screen';
import ProfileScreen from '../screens/profile/profile.screen';
import SignInScreen from '../screens/singin/signin.screen';
import SignUpScreen from '../screens/signup/signup.screen';
import ResetScreen from '../screens/reset/reset.screen';
import VerifyScreen from '../screens/verify/verify.screen';
import OtpScreen from '../screens/otp/otp.screen';
import CarListScreen from '../screens/cars/car-list.screen';
import CarDetailScreen from '../screens/cars/car-detail.screen';
import BookingDetailScreen from '../screens/bookings/booking-detail.screen';
import BookingFormScreen from '../screens/bookings/booking-form.screen';

type NavigationProps = Partial<
  React.ComponentProps<typeof NavigationContainer>
>;

const av = new Animated.Value(0);
av.addListener(() => {
  return;
});
const Stack = createStackNavigator<NavigatorParamList>();
const Tab = createBottomTabNavigator<NavigatorParamList>();

const TabStack = () => {
  const styles = createStyle();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarHideOnKeyboard: true,
        keyboardHidesTabBar: true,
        tabBarIcon: ({focused, size}) => {
          let iconName: string = 'camera';
          let tabName: string = 'Home';
          if (route.name == 'OnBoardingScreen') {
            iconName = focused ? 'camera' : 'camera';
            tabName = 'Camera';
          }
          return (
            <View style={styles.tabContainer}>
              <MaterialCommunityIcons
                name={iconName}
                size={scale(focused ? 25 : 23)}
                color={focused ? colors.white : colors.icon}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.textStyle,
                  {
                    fontWeight: focused ? '600' : '400',
                    color: focused ? colors.white : colors.icon,
                  },
                ]}>
                {tabName}
              </Text>
            </View>
          );
        },
        headerShown: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: scale(12),
        },
        lazy: false,
        tabBarStyle: {
          height:
            Platform.OS == 'ios'
              ? scale(50 + useSafeAreaInsets().bottom)
              : scale(60),
          backgroundColor: colors.black,
        },
      })}
      initialRouteName={'Home'}>
      {/* MainTab: replace with real home screens for the authenticated user */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home', tabBarShowLabel: false}}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsListScreen}
        options={{tabBarLabel: 'Bookings', tabBarShowLabel: false}}
      />
      <Tab.Screen
        name="Cars"
        component={CarListScreen}
        options={{tabBarLabel: 'Cars', tabBarShowLabel: false}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile', tabBarShowLabel: false}}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="OnBoardingScreen"
        component={OnBoardingScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="OnBoardingScreenTwo"
        component={OnBoardingScreenTwo}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ResetScreen"
        component={ResetScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="VerifyScreen"
        component={VerifyScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="OnBoardingScreen"
        component={OnBoardingScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

const CombinedStack = () => {
  // use auth state to determine which stack to show
  const {isAuthenticated} = useAuth();
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: true}}>
      <Stack.Screen
        name="auth"
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        component={isAuthenticated ? TabStack : AuthStack}
      />
      <Stack.Screen
        name="CarDetail"
        component={CarDetailScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="BookingForm"
        component={BookingFormScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="tabStack"
        component={TabStack}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="authStack"
        component={AuthStack}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="rootStack"
        component={RootStack}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};

export function AppNavigator(props: NavigationProps) {
  return (
    <NavigationContainer ref={navigationRef as any} {...props}>
      {CombinedStack()}
    </NavigationContainer>
  );
}
