"use client"
import type React from "react"
import { Animated } from "react-native"

import { NavigationContainer } from "@react-navigation/native"
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"


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
import AllCarsScreen from "../screens/cars/all-cars.screen"
import CarDetailScreen from "../screens/cars/car-detail.screen"
import BookingDetailScreen from "../screens/bookings/booking-detail.screen"
import BookingFormScreen from "../screens/bookings/booking-form.screen"
import BookingPaymentScreen from "../screens/bookings/booking-payment.screen"
import PayOSWebViewScreen from "../screens/bookings/payos-webview.screen"
import CarMapScreen from "../screens/cars/car-map.screen"
import CarMapRouteScreen from "../screens/cars/car-map-route.screen"
import StaffScreen from "../screens/staff/staff.screen"
import PickupReturnConfirmScreen from "../screens/staff/pickup-return-confirm.screen"
import VehicleReturnScreen from "../screens/staff/vehicle-return.screen"
import UserReportScreen from "../screens/staff/user-report.screen"
import FeedbackFormScreen from "../screens/feedback/feedback-form.screen"
import PaymentHistoryScreen from "../screens/payments/payment-history.screen"
import MessagesScreen from "../screens/messages/messages.screen"
import ChatHeadsScreen from "../screens/chat/chat-heads.screen"
import ChatScreen from "../screens/chat/chat.screen"
import ReportCarScreen from "../screens/bookings/report-car.screen"

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
        name="AllCars"
        component={AllCarsScreen}
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

const StaffStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="StaffScreen"
        component={StaffScreen}
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
      <Stack.Screen
        name="PickupReturnConfirm"
        component={PickupReturnConfirmScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="VehicleReturn"
        component={VehicleReturnScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="UserReport"
        component={UserReportScreen}
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

  const { isAuthenticated, user } = useAuth()

  // Check if user is staff
  const userRole = user?.role?.toLowerCase()
  const isStaff = userRole === "staff" || user?.roleId === 1002

  console.log("CombinedStack: Navigation decision", {
    isAuthenticated,
    userRole,
    roleId: user?.roleId,
    isStaff,
    userId: user?.id
  })

  if (!isAuthenticated) {
    console.log("CombinedStack: User not authenticated, showing AuthStack")
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="authStack"
          component={AuthStack}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
      </Stack.Navigator>
    )
  }

  if (isStaff) {
    console.log("CombinedStack: User is staff, showing StaffStack")
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="staffStack"
          component={StaffStack}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
      </Stack.Navigator>
    )
  }

  console.log("CombinedStack: User authenticated as customer, showing MainStack")
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="tabStack"
        component={MainStack}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  )
}

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="auth"
        component={CombinedStack}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
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
        name="BookingPayment"
        component={BookingPaymentScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="PayOSWebView"
        component={PayOSWebViewScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          presentation: 'modal',
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
        name="FeedbackForm"
        component={FeedbackFormScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ChatHeads"
        component={ChatHeadsScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ReportCar"
        component={ReportCarScreen}
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
      <AppStack />
    </NavigationContainer>
  )
}
