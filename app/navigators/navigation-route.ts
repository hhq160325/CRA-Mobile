export type NavigatorParamList = {
  ['OnBoardingScreen']: undefined;
  ['OnBoardingScreenTwo']: undefined;
  ['SignInScreen']: undefined;
  ['SignUpScreen']: undefined;
  ['ResetScreen']: undefined;
  ['VerifyScreen']: undefined;
  ['OtpScreen']: undefined;
  ['Home']: undefined;
  ['Bookings']: undefined;
  ['Cars']: undefined;
  ['Profile']: undefined;
  ['CarDetail']: { id: string };
  ['BookingDetail']: { id: string };
  ['BookingForm']: { id: string } | undefined;
};

export type ScreenName = keyof NavigatorParamList;
