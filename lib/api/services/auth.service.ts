
export type {
  User,
  LoginCredentials,
  RegisterData,
  GoogleLoginData,
  RefreshTokenData,
  TokenResponse,
  ApiUserResponse,
} from './auth/types';


import { login } from './auth/loginService';
import { register } from './auth/registerService';
import { loginWithGoogle, loginWithGoogleMobile, getGoogleLoginUrl } from './auth/googleLoginService';
import { refreshToken as refreshTokenFn } from './auth/tokenRefreshService';
import { forgotPassword, verifyResetCode, resetPassword, resetPasswordByPhone } from './auth/passwordResetService';
import { verifySignupOtp, verifySignupOtpByPhone } from './auth/signupOtpService';
import {
  getUserFromStorage,
  getRefreshTokenFromStorage,
  clearAuthFromStorage,
  getRememberMeCredentials,
  clearRememberMeCredentials,
} from './auth/storageHelpers';


export const authService = {

  login,
  register,
  loginWithGoogle,
  loginWithGoogleMobile,
  getGoogleLoginUrl,


  refreshToken: refreshTokenFn,
  getRefreshToken: getRefreshTokenFromStorage,


  getCurrentUser: getUserFromStorage,
  logout: async (keepRememberMe: boolean = true): Promise<{ error: Error | null }> => {
    try {
      await clearAuthFromStorage(keepRememberMe);
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  },


  getRememberMeCredentials,
  clearRememberMeCredentials,


  forgotPassword,
  verifyResetCode,
  resetPassword,
  resetPasswordByPhone,


  verifySignupOtp,
  verifySignupOtpByPhone,
};
