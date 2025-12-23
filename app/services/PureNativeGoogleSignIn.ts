import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../lib/api/services/auth.service';

// Conditional import for Google Sign-In
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSignInModule.GoogleSignin;
    statusCodes = googleSignInModule.statusCodes;
} catch (error) {
    console.log('Google Sign-In native module not available (Expo Go)');
}

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

    configure(): boolean {
        try {
            console.log(' === Configuring Pure Native Google Sign-In ===');

            if (!GoogleSignin) {
                console.error(' Google Sign-In native module not available');
                console.error(' This requires a development build, not Expo Go');
                console.error(' Run: npx expo run:android or build with EAS');
                this.isConfigured = false;
                return false;
            }

            console.log(' GoogleSignin module loaded successfully');

            const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
            console.log(' Checking Android Client ID...');
            console.log(' Android Client ID from env:', androidClientId ? 'Found' : 'Not found');

            if (!androidClientId || androidClientId === 'YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com') {
                console.error(' Android Client ID not configured in .env file');
                console.error(' Please add your Google Cloud Console Android Client ID to .env');
                console.error(' GOOGLE_ANDROID_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com');
                this.isConfigured = false;
                return false;
            }

            console.log(' Configuring GoogleSignin with options...');
            const config = {
                androidClientId: androidClientId,
                scopes: ['openid', 'profile', 'email'],
                offlineAccess: false,
                hostedDomain: '',
                forceCodeForRefreshToken: false,
                accountName: '',
                profileImageSize: 120,
            };
            console.log(' Configuration:', JSON.stringify(config, null, 2));

            GoogleSignin.configure(config);

            this.isConfigured = true;
            console.log(' ✅ PURE NATIVE Google Sign-In configured successfully');
            console.log(' Android Client ID:', androidClientId);
            console.log(' NO Web Client ID');
            console.log(' NO iOS Client ID');
            console.log(' Android Client ID + SHA-1 ONLY');
            console.log(' EAS Build APK');
            console.log(' Package: com.carapp.app');
            console.log(' SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF');
            return true;
        } catch (error) {
            console.error(' === Pure Native configuration FAILED ===');
            console.error(' Error:', error);
            this.isConfigured = false;
            return false;
        }
    }

    /**
     * Kiểm tra Google Play Services
     */
    async checkPlayServices(): Promise<boolean> {
        try {
            if (!GoogleSignin) {
                console.error(' GoogleSignin module not available');
                return false;
            }

            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true
            });
            console.log(' Google Play Services available');
            return true;
        } catch (error: any) {
            console.error(' Google Play Services error:', error);
            console.error(' Error code:', error.code);
            console.error(' Error message:', error.message);

            // Don't block sign-in for Play Services issues on real devices
            // Many real devices have Play Services but the check might fail
            console.log(' Continuing with sign-in despite Play Services check failure');
            return true;
        }
    }


    async signIn(): Promise<PureNativeGoogleAuthResult> {
        try {
            console.log(' === Starting Pure Native Google Sign-In ===');

            if (!GoogleSignin) {
                console.error(' GoogleSignin module not loaded');
                return {
                    success: false,
                    error: 'Google Sign-In module not available',
                    errorCode: 'MODULE_NOT_AVAILABLE'
                };
            }

            if (!this.isConfigured) {
                console.error(' Google Sign-In not configured');
                return {
                    success: false,
                    error: 'Pure Native Google Sign-In chưa được cấu hình',
                    errorCode: 'NOT_CONFIGURED'
                };
            }

            console.log(' Checking Google Play Services...');
            const hasPlayServices = await this.checkPlayServices();
            if (!hasPlayServices) {
                console.log(' Play Services check failed, but continuing...');
            }

            console.log(' Starting PURE Native Google Sign-In...');
            console.log(' Method: Android Client ID + SHA-1');
            console.log(' NO Web Client ID needed');

            // Pure Native Sign-In
            console.log(' Calling GoogleSignin.signIn()...');
            const signInResult = await GoogleSignin.signIn();
            console.log('✅ Pure Native sign-in successful');
            console.log(' Sign-in result:', JSON.stringify(signInResult, null, 2));

            // Extract user data and tokens from sign-in result
            const userData = (signInResult as any).data?.user || (signInResult as any).user;
            const serverAuthCode = (signInResult as any).data?.serverAuthCode || (signInResult as any).serverAuthCode;
            const idToken = (signInResult as any).data?.idToken || (signInResult as any).idToken;

            console.log(' User data:', userData);
            console.log(' ID Token available:', !!idToken);
            console.log(' Server Auth Code available:', !!serverAuthCode);

            if (!userData) {
                console.error(' No user data received from Google Sign-In');
                return {
                    success: false,
                    error: 'No user data received from Google',
                    errorCode: 'NO_USER_DATA'
                };
            }

            const user: PureNativeGoogleUser = {
                id: userData.id,
                name: userData.name || '',
                email: userData.email,
                photo: userData.photo || undefined,
                familyName: userData.familyName || undefined,
                givenName: userData.givenName || undefined,
                serverAuthCode: serverAuthCode || undefined,
            };

            console.log(' Extracted user:', user);

            // Authenticate with backend using mobile API
            if (idToken) {
                console.log(' Authenticating with backend mobile API...');
                try {
                    const backendResult = await authService.loginWithGoogleMobile(idToken);

                    if (backendResult.data) {
                        console.log(' Backend authentication successful');
                        console.log(' Backend user:', backendResult.data.name);

                        await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                        await AsyncStorage.setItem('isPureNativeSignedIn', 'true');
                        await AsyncStorage.setItem('pureNativeSignInTime', Date.now().toString());
                        await AsyncStorage.setItem('backendAuthenticated', 'true');

                        console.log(' User:', user.name);
                        console.log('Email:', user.email);
                        console.log(' Backend Auth: Success');

                        return {
                            success: true,
                            user: user,
                        };
                    } else {
                        console.log(' Backend authentication failed:', backendResult.error?.message);

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
                    console.error(' Backend authentication error:', backendError);

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
                console.log(' No ID token available, skipping backend authentication');

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
            console.error(' === Pure Native Sign-In ERROR ===');
            console.error(' Error:', error);
            console.error(' Error code:', error.code);
            console.error(' Error message:', error.message);
            console.error(' Full error object:', JSON.stringify(error, null, 2));

            let errorMessage = 'Login Fail';
            let errorCode = 'UNKNOWN_ERROR';

            if (statusCodes) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        errorMessage = 'User cancelled login';
                        errorCode = 'SIGN_IN_CANCELLED';
                        break;
                    case statusCodes.IN_PROGRESS:
                        errorMessage = 'Sign-in already in progress';
                        errorCode = 'IN_PROGRESS';
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        errorMessage = 'Google Play Services not available';
                        errorCode = 'PLAY_SERVICES_NOT_AVAILABLE';
                        break;
                    case statusCodes.SIGN_IN_REQUIRED:
                        errorMessage = 'Sign-in required';
                        errorCode = 'SIGN_IN_REQUIRED';
                        break;
                    default:
                        errorMessage = error.message || 'Unknown error occurred';
                        errorCode = error.code || 'UNKNOWN_ERROR';
                }
            } else {
                errorMessage = error.message || 'Google Sign-In module error';
                errorCode = error.code || 'MODULE_ERROR';
            }

            return {
                success: false,
                error: errorMessage,
                errorCode: errorCode,
            };
        }
    }


    async signOut(): Promise<boolean> {
        try {
            console.log('= Pure Native Sign-Out...');
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
                console.log(' Backend logout successful');
            } catch (error) {
                console.log(' Backend logout error (continuing):', error);
            }

            console.log(' Pure Native Sign-Out successful');
            return true;
        } catch (error) {
            console.error(' Pure Native Sign-Out error:', error);
            return false;
        }
    }


    async revokeAccess(): Promise<boolean> {
        try {
            console.log(' Revoking Pure Native access...');
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
                console.log(' Backend logout successful');
            } catch (error) {
                console.log(' Backend logout error (continuing):', error);
            }

            console.log(' Pure Native access revoked');
            return true;
        } catch (error) {
            console.error(' Pure Native revoke error:', error);
            return false;
        }
    }


    async isSignedIn(): Promise<boolean> {
        try {
            const localSignedIn = await AsyncStorage.getItem('isPureNativeSignedIn');
            const googleUser = await GoogleSignin.getCurrentUser();

            const result = !!googleUser && localSignedIn === 'true';
            console.log(' Pure Native sign-in status:', result);
            return result;
        } catch (error) {
            console.error(' Check Pure Native status error:', error);
            return false;
        }
    }


    async getCurrentUser(): Promise<PureNativeGoogleUser | null> {
        try {

            const storedUser = await AsyncStorage.getItem('pureNativeGoogleUser');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                console.log(' Pure Native user from storage:', user.name);
                return user;
            }

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

                await AsyncStorage.setItem('pureNativeGoogleUser', JSON.stringify(user));
                await AsyncStorage.setItem('isPureNativeSignedIn', 'true');

                console.log(' Pure Native user refreshed:', user.name);
                return user;
            }

            console.log('👤 No Pure Native user found');
            return null;
        } catch (error) {
            console.error('❌ Get Pure Native user error:', error);
            return null;
        }
    }


    async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                'pureNativeGoogleUser',
                'isPureNativeSignedIn',
                'pureNativeSignInTime',
                'backendAuthenticated'
            ]);
            console.log(' All Pure Native data cleared');
        } catch (error) {
            console.error(' Clear Pure Native data error:', error);
        }
    }


    async getDebugInfo(): Promise<any> {
        try {
            const isSignedIn = await this.isSignedIn();
            const currentUser = await this.getCurrentUser();
            const signInTime = await AsyncStorage.getItem('pureNativeSignInTime');
            const backendAuthenticated = await AsyncStorage.getItem('backendAuthenticated');

            return {
                type: 'PURE Native Google Sign-In',
                method: 'Android Client ID + SHA-1 ONLY',
                webClientId: ' NOT USED',
                iosClientId: ' NOT USED',
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


    getConfigurationStatus(): any {
        return {
            type: 'PURE Native Google Sign-In',
            isConfigured: this.isConfigured,
            authMethod: 'Android Client ID + SHA-1 ONLY',
            webClientId: ' NOT NEEDED',
            iosClientId: ' NOT NEEDED',
            requirements: [
                ' Android Client ID trong Google Cloud Console',
                ' SHA-1: A5:65:0E:66:70:7D:82:FD:C6:95:A4:20:7C:E5:6B:B8:B0:4A:99:FF',
                ' Package: com.carapp.app',
                ' EAS Build APK',
                ' Real Android device',
                ' NO Web Client ID',
                ' NO iOS Client ID',
                ' NO expo-auth-session',
                ' NO expo-web-browser'
            ]
        };
    }
}

// Export singleton
export const pureNativeGoogleSignIn = new PureNativeGoogleSignIn();
export default pureNativeGoogleSignIn;