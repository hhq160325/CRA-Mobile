"use client"

/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable eqeqeq */
import type React from "react"
import { Animated } from "react-native"

import { NavigationContainer } from "@react-navigation/native"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"

// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NavigatorParamList } from "./navigation-route"
import { navigationRef } from "./navigation-utilities"
import { useAuth } from "../../lib/auth-context"

import OnBoardingScreen from "../screens/onboarding/onboarding.screen"
import OnBoardingScreenTwo from "../screens/onboarding/onboardingTwo.screen"
import HomeScreen from "../screens/home/home.screen"
import BookingsListScreen from "../screens/bookings/bookings-list.screen"
import ProfileScreen from "../screens/profile/profile.screen"
import SignInScreen from "../screens/singin/signin.screen"
import SignUpScreen from "../screens/signup/signup.screen"
import ResetScreen from "../screens/reset/reset.screen"
import VerifyScreen from "../screens/verify/verify.screen"
import OtpScreen from "../screens/otp/otp.screen"
import GoogleLoginWebView from "../screens/singin/google-login-webview.screen"
import GoogleOAuthHandler from "../screens/singin/google-oauth-handler.screen"
import CarListScreen from "../screens/cars/car-list.screen"
import CarDetailScreen from "../screens/cars/car-detail.screen"
import BookingDetailScreen from "../screens/bookings/booking-detail.screen"
import BookingFormScreen from "../screens/bookings/booking-form.screen"
import CarMapScreen from "../screens/cars/car-map.screen"
import CarMapRouteScreen from "../screens/cars/car-map-route.screen"
import StaffScreen from "../screens/staff/staff.screen"
import PickupReturnConfirmScreen from "../screens/staff/pickup-return-confirm.screen"

type NavigationProps = Partial<React.ComponentProps<typeof NavigationContainer>>

const av = new Animated.Value(0)
av.addListener(() => {
  return
})
const Stack = createStackNavigator<NavigatorParamList>()


const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Bookings"
        component={BookingsListScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Cars"
        component={CarListScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  )
}

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen
        name="GoogleLoginWebView"
        component={GoogleLoginWebView}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="GoogleOAuthHandler"
        component={GoogleOAuthHandler}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

const RootStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OnBoardingScreen"
        component={OnBoardingScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  )
}

const CombinedStack = () => {

  const { isAuthenticated } = useAuth()
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="auth"
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        component={isAuthenticated ? MainStack : AuthStack}
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
        name="CarMapScreen"
        component={CarMapScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="CarMapRouteScreen"
        component={CarMapRouteScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="tabStack"
        component={MainStack}
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
      <Stack.Screen
        name="StaffScreen"
        component={StaffScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="PickupReturnConfirm"
        component={PickupReturnConfirmScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  )
}

export function AppNavigator(props: NavigationProps) {
  return (
    <NavigationContainer ref={navigationRef as any} {...props}>
      {CombinedStack()}
    </NavigationContainer>
  )
}
