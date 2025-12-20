import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../lib/api/services/auth.service';

export interface PureNativeGoogleUser {
    id: string;
    name: string;
    email: string;
    photo?: string;
    familyName?: string;
    givenName?: string;
    serverAuthCode?: string;
}

export interface PureNativeGoogleAuthResult {
    success: boolean;
    user?: PureNativeGoogleUser;
    error?: string;
    errorCode?: string;
}

class PureNativeGoogleSignIn {
    private isConfigured = false;

    /**
     * Configure PURE Native Google Sign-In
     * 🚫 HOÀN TOÀN KHÔNG cần Web Client ID
     * ✅ Chỉ dùng Android Client ID + SHA-1
     * ✅ Google tự động detect từ APK signature
     */
    configure(): boolean {
        try {
            GoogleSignin.configure({
                // 🚫 KHÔNG có webClientId - Pure Native
                // 🚫 KHÔNG có iosClientId - Android only

                // ✅ Pure Native Android configuration
                scopes: ['openid', 'profile', 'email'],
                offlineAccess: false, // Native không cần offline
                hostedDomain: '', // Tất cả domains
                forceCodeForRefreshToken: false, // Không cần
                accountName: '', // Android specific
                profileImageSize: 120,
            });

            this.isConfigured = true;
            console.log('🎯 PURE NATIVE Google Sign-In configured');
            console.log('🚫 NO Web Client ID');
            console.log('🚫 NO iOS Client ID');
            console.log('✅ Android Client ID + SHA-1 ONLY');
            console.log('📱 EAS Build APK');
            console.log('📋 Package: com.carapp.app');
            console.log('🔑 SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF');
            return true;
        } catch (error) {
            console.error('❌ Pure Native configuration failed:', error);
            this.isConfigured = false;
            return false;
        }
    }

    /**
     * Kiểm tra Google Play Services
     */
    async checkPlayServices(): Promise<boolean> {
        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true
            });
            console.log('✅ Google Play Services available');
            return true;
        } catch (error: any) {
            console.error('❌ Google Play Services error:', error);
            return false;
        }
    }

    /**
     * PURE Native Google Sign-In
     * Không cần Web Client ID, chỉ Android Client ID + SHA-1
     */
    async signIn(): Promise<PureNativeGoogleAuthResult> {
        try {
            if (!this.isConfigured) {
                return {
                    success: false,
                    error: 'Pure Native Google Sign-In chưa được cấu hình',
                    errorCode: 'NOT_CONFIGURED'
                };
            }

            console.log('🔍 Checking Google Play Services...');
            const hasPlayServices = await this.checkPlayServices();
            if (!hasPlayServices) {
                return {
                    success: false,
                    error: 'Google Play Services không khả dụng',
                    errorCode: 'PLAY_SERVICES_NOT_AVAILABLE'
                };
            }

            console.log('🚀 Starting PURE Native Google Sign-In...');
            console.log('📱 Method: Android Client ID + SHA-1');
            console.log('🚫 NO Web Client ID needed');

            // Pure Native Sign-In
            const signInResult = await GoogleSignin.signIn();
            console.log('✅ Pure Native sign-in successful');

            // Extract user data and tokens from sign-in result
            const userData = (signInResult as any).data?.user || (signInResult as any).user;
            const serverAuthCode = (signInResult as any).data?.serverAuthCode || (signInResult as any).serverAuthCode;
            const idToken = (signInResult as any).data?.idToken || (signInResult as any).idToken;

            console.log('🔑 ID Token available:', !!idToken);
            console.log('🔑 Server Auth Code available:', !!serverAuthCode);

            const user: PureNativeGoogleUser = {
                id: userData.id,
                name: userData.name || '',
                email: userData.email,
                photo: userData.photo || undefined,
                familyName: userData.familyName || undefined,
                givenName: userData.givenName || undefined,
                serverAuthCode: serverAuthCode || undefined,
            };

            // Authenticate with backend using mobile API
            if (idToken) {
                console.log('🚀 Authenticating with backend mobile API...');
                try {
                    const backendResult = await authService.loginWithGoogleMobile(idToken);

                    if (backendResult.data) {
                        console.log('✅ Backend authentication successful');
                        console.log('👤 Backend user:', backendResult.data.name);

                        // Backend authentication successful, user is now logged into the app
                        await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                        await AsyncStorage.setItem('isPureNativeSignedIn', 'true');
                        await AsyncStorage.setItem('pureNativeSignInTime', Date.now().toString());
                        await AsyncStorage.setItem('backendAuthenticated', 'true');

                        console.log('👤 User:', user.name);
                        console.log('📧 Email:', user.email);
                        console.log('🔐 Backend Auth: Success');

                        return {
                            success: true,
                            user: user,
                        };
                    } else {
                        console.log('❌ Backend authentication failed:', backendResult.error?.message);

                        // Still save Google user data but mark backend auth as failed
                        await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                        await AsyncStorage.setItem('isPureNativeSignedIn', 'true');
                        await AsyncStorage.setItem('pureNativeSignInTime', Date.now().toString());
                        await AsyncStorage.setItem('backendAuthenticated', 'false');

                        return {
                            success: false,
                            error: `Google sign-in successful but backend authentication failed: ${backendResult.error?.message}`,
                            errorCode: 'BACKEND_AUTH_FAILED'
                        };
                    }
                } catch (backendError: any) {
                    console.error('❌ Backend authentication error:', backendError);

                    // Still save Google user data but mark backend auth as failed
                    await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                    await AsyncStorage.setItem('isPureNativeSignedIn', 'true');
                    await AsyncStorage.setItem('pureNativeSignInTime', Date.now().toString());
                    await AsyncStorage.setItem('backendAuthenticated', 'false');

                    return {
                        success: false,
                        error: `Google sign-in successful but backend error: ${backendError.message}`,
                        errorCode: 'BACKEND_ERROR'
                    };
                }
            } else {
                console.log('⚠️ No ID token available, skipping backend authentication');

                // Save Google user data without backend auth
                await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                await AsyncStorage.setItem('isPureNativeSignedIn', 'true');
                await AsyncStorage.setItem('pureNativeSignInTime', Date.now().toString());
                await AsyncStorage.setItem('backendAuthenticated', 'false');

                return {
                    success: false,
                    error: 'Google sign-in successful but no ID token for backend authentication',
                    errorCode: 'NO_ID_TOKEN'
                };
            }

        } catch (error: any) {
            console.error('❌ Pure Native Sign-In error:', error);

            let errorMessage = 'Đăng nhập thất bại';
            let errorCode = 'UNKNOWN_ERROR';

            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    errorMessage = 'Người dùng hủy đăng nhập';
                    errorCode = 'SIGN_IN_CANCELLED';
                    break;
                case statusCodes.IN_PROGRESS:
                    errorMessage = 'Đang trong quá trình đăng nhập';
                    errorCode = 'IN_PROGRESS';
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    errorMessage = 'Google Play Services không khả dụng';
                    errorCode = 'PLAY_SERVICES_NOT_AVAILABLE';
                    break;
                case statusCodes.SIGN_IN_REQUIRED:
                    errorMessage = 'Cần đăng nhập lại';
                    errorCode = 'SIGN_IN_REQUIRED';
                    break;
                default:
                    errorMessage = error.message || 'Lỗi không xác định';
                    errorCode = error.code || 'UNKNOWN_ERROR';
            }

            return {
                success: false,
                error: errorMessage,
                errorCode: errorCode,
            };
        }
    }

    /**
     * Đăng xuất Pure Native
     */
    async signOut(): Promise<boolean> {
        try {
            console.log('🚪 Pure Native Sign-Out...');
            await GoogleSignin.signOut();

            // Clear both Google and backend auth data
            await AsyncStorage.multiRemove([
                'pureNativeGoogleUser',
                'isPureNativeSignedIn',
                'pureNativeSignInTime',
                'backendAuthenticated'
            ]);

            // Also clear main app auth data
            try {
                await authService.logout();
                console.log('✅ Backend logout successful');
            } catch (error) {
                console.log('⚠️ Backend logout error (continuing):', error);
            }

            console.log('✅ Pure Native Sign-Out successful');
            return true;
        } catch (error) {
            console.error('❌ Pure Native Sign-Out error:', error);
            return false;
        }
    }

    /**
     * Thu hồi quyền truy cập Pure Native
     */
    async revokeAccess(): Promise<boolean> {
        try {
            console.log('🔐 Revoking Pure Native access...');
            await GoogleSignin.revokeAccess();

            // Clear both Google and backend auth data
            await AsyncStorage.multiRemove([
                'pureNativeGoogleUser',
                'isPureNativeSignedIn',
                'pureNativeSignInTime',
                'backendAuthenticated'
            ]);

            // Also clear main app auth data
            try {
                await authService.logout();
                console.log('✅ Backend logout successful');
            } catch (error) {
                console.log('⚠️ Backend logout error (continuing):', error);
            }

            console.log('✅ Pure Native access revoked');
            return true;
        } catch (error) {
            console.error('❌ Pure Native revoke error:', error);
            return false;
        }
    }

    /**
     * Kiểm tra trạng thái đăng nhập Pure Native
     */
    async isSignedIn(): Promise<boolean> {
        try {
            const isSignedIn = await GoogleSignin.isSignedIn();
            const localSignedIn = await AsyncStorage.getItem('isPureNativeSignedIn');

            const googleSignedIn = await GoogleSignin.getCurrentUser();
            const result = !!googleSignedIn && localSignedIn === 'true';
            console.log('🔍 Pure Native sign-in status:', result);
            return result;
        } catch (error) {
            console.error('❌ Check Pure Native status error:', error);
            return false;
        }
    }

    /**
     * Lấy thông tin user Pure Native hiện tại
     */
    async getCurrentUser(): Promise<PureNativeGoogleUser | null> {
        try {
            // Thử AsyncStorage trước
            const storedUser = await AsyncStorage.getItem('pureNativeGoogleUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                console.log('📱 Pure Native user from storage:', user.name);
                return user;
            }

            // Thử Google SDK
            const currentUser = await GoogleSignin.getCurrentUser();
            if (currentUser) {
                // Extract user data from current user result
                const userData = (currentUser as any).data?.user || (currentUser as any).user;
                const serverAuthCode = (currentUser as any).data?.serverAuthCode || (currentUser as any).serverAuthCode;

                const user: PureNativeGoogleUser = {
                    id: userData.id,
                    name: userData.name || '',
                    email: userData.email,
                    photo: userData.photo || undefined,
                    familyName: userData.familyName || undefined,
                    givenName: userData.givenName || undefined,
                    serverAuthCode: serverAuthCode || undefined,
                };

                // Lưu lại
                await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                await AsyncStorage.setItem('isPureNativeSignedIn', 'true');

                console.log('🔄 Pure Native user refreshed:', user.name);
                return user;
            }

            console.log('👤 No Pure Native user found');
            return null;
        } catch (error) {
            console.error('❌ Get Pure Native user error:', error);
            return null;
        }
    }

    /**
     * Clear tất cả dữ liệu Pure Native
     */
    async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                'pureNativeGoogleUser',
                'isPureNativeSignedIn',
                'pureNativeSignInTime',
                'backendAuthenticated'
            ]);
            console.log('🧹 All Pure Native data cleared');
        } catch (error) {
            console.error('❌ Clear Pure Native data error:', error);
        }
    }

    /**
     * Debug info cho Pure Native
     */
    async getDebugInfo(): Promise<any> {
        try {
            const isSignedIn = await this.isSignedIn();
            const currentUser = await this.getCurrentUser();
            const signInTime = await AsyncStorage.getItem('pureNativeSignInTime');
            const backendAuthenticated = await AsyncStorage.getItem('backendAuthenticated');

            return {
                type: 'PURE Native Google Sign-In',
                method: 'Android Client ID + SHA-1 ONLY',
                webClientId: '🚫 NOT USED',
                iosClientId: '🚫 NOT USED',
                isConfigured: this.isConfigured,
                isSignedIn,
                backendAuthenticated: backendAuthenticated === 'true',
                currentUser: currentUser ? {
                    name: currentUser.name,
                    email: currentUser.email,
                    id: currentUser.id
                } : null,
                signInTime: signInTime ? new Date(parseInt(signInTime)).toISOString() : null,
                packageName: 'com.carapp.app',
                sha1: 'A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF',
                buildType: 'EAS Build APK',
                authMethod: 'Pure Native - No Web Dependencies',
                backendAPI: 'Mobile Google Login API',
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            return {
                type: 'PURE Native Google Sign-In',
                error: error?.message || 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Configuration status
     */
    getConfigurationStatus(): any {
        return {
            type: 'PURE Native Google Sign-In',
            isConfigured: this.isConfigured,
            authMethod: 'Android Client ID + SHA-1 ONLY',
            webClientId: '🚫 NOT NEEDED',
            iosClientId: '🚫 NOT NEEDED',
            requirements: [
                '✅ Android Client ID trong Google Cloud Console',
                '✅ SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF',
                '✅ Package: com.carapp.app',
                '✅ EAS Build APK',
                '✅ Real Android device',
                '🚫 NO Web Client ID',
                '🚫 NO iOS Client ID',
                '🚫 NO expo-auth-session',
                '🚫 NO expo-web-browser'
            ]
        };
    }
}

// Export singleton
export const pureNativeGoogleSignIn = new PureNativeGoogleSignIn();
export default pureNativeGoogleSignIn;