// Export types
export type {
  User,
  LoginCredentials,
  RegisterData,
  GoogleLoginData,
  RefreshTokenData,
  TokenResponse,
  ApiUserResponse,
} from './auth/types';

// Import service functions
import { login } from './auth/loginService';
import { register } from './auth/registerService';
import { loginWithGoogle, loginWithGoogleMobile, getGoogleLoginUrl } from './auth/googleLoginService';
import { refreshToken as refreshTokenFn } from './auth/tokenRefreshService';
import { forgotPassword, verifyResetCode, resetPassword, resetPasswordByPhone } from './auth/passwordResetService';
import { verifySignupOtp } from './auth/signupOtpService';
import {
  getUserFromStorage,
  getRefreshTokenFromStorage,
  clearAuthFromStorage,
} from './auth/storageHelpers';

// Main auth service object
export const authService = {
  // Authentication methods
  login,
  register,
  loginWithGoogle,
  loginWithGoogleMobile,
  getGoogleLoginUrl,

  // Token management
  refreshToken: refreshTokenFn,
  getRefreshToken: getRefreshTokenFromStorage,

  // User management
  getCurrentUser: getUserFromStorage,
  logout: async (): Promise<{ error: Error | null }> => {
    try {
      await clearAuthFromStorage();
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  },

  // Password reset
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resetPasswordByPhone,

  // Signup OTP
  verifySignupOtp,
};
