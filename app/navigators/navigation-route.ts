export type NavigatorParamList = {
  ['OnBoardingScreen']: undefined;
  ['OnBoardingScreenTwo']: undefined;
  ['SignInScreen']: undefined;
  ['SignUpScreen']: undefined;
  ['ResetScreen']: undefined;
  ['VerifyScreen']: undefined;
  ['OtpScreen']: undefined;
  ['GoogleLoginWebView']: undefined;
  ['GoogleOAuthHandler']: undefined;
  ['Home']: undefined;
  ['Bookings']: undefined;
  ['Cars']: undefined;
  ['Profile']: undefined;
  ['CarDetail']: { id: string };
  ['BookingDetail']: { id: string };
  ['BookingForm']: { id: string } | undefined;
  ['CarMapScreen']: {
    pickupLocation: string;
    pickupDate: string;
    pickupTime: string;
    dropoffLocation: string;
    dropoffDate: string;
    dropoffTime: string;
    showRoute?: boolean;
  };
  ['Staff']: undefined;
  ['StaffScreen']: undefined;
  ['PickupReturnConfirm']: { paymentId: string };
  ['auth']: undefined;
  ['tabStack']: undefined;
  ['authStack']: undefined;
  ['rootStack']: undefined;
};

export type ScreenName = keyof NavigatorParamList;
