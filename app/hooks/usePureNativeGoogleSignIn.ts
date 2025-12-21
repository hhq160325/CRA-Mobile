import { useState, useEffect, useCallback } from 'react';
import { pureNativeGoogleSignIn, PureNativeGoogleUser } from '../services/PureNativeGoogleSignIn';

interface UsePureNativeGoogleSignInReturn {
    user: PureNativeGoogleUser | null;
    isLoading: boolean;
    isSignedIn: boolean;
    isConfigured: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    revokeAccess: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
    debugInfo: any;
    configStatus: any;
}

export const usePureNativeGoogleSignIn = (): UsePureNativeGoogleSignInReturn => {
    const [user, setUser] = useState<PureNativeGoogleUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [configStatus, setConfigStatus] = useState<any>(null);

    // Initialize Pure Native Google Sign-In
    useEffect(() => {
        initializePureNative();
    }, []);

    // Check auth status after initialize
    useEffect(() => {
        if (isConfigured) {
            checkAuthStatus();
        }
    }, [isConfigured]);

    const initializePureNative = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log(' Initializing PURE Native Google Sign-In...');
            console.log(' NO Web Client ID needed');
            console.log(' Android Client ID + SHA-1 ONLY');

            const success = pureNativeGoogleSignIn.configure();

            if (success) {
                setIsConfigured(true);
                console.log(' Pure Native configured successfully');

                // Get config status
                const status = pureNativeGoogleSignIn.getConfigurationStatus();
                setConfigStatus(status);
            } else {
                throw new Error('Không thể cấu hình Pure Native Google Sign-In');
            }
        } catch (err: any) {
            console.error(' Initialize Pure Native error:', err);
            setError(err.message || 'Lỗi khởi tạo Pure Native');
            setIsConfigured(false);
        } finally {
            setIsLoading(false);
        }
    };

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log(' Checking Pure Native auth status...');
            const signedIn = await pureNativeGoogleSignIn.isSignedIn();
            setIsSignedIn(signedIn);

            if (signedIn) {
                const currentUser = await pureNativeGoogleSignIn.getCurrentUser();
                setUser(currentUser);
                console.log(' Pure Native user found:', currentUser?.name);
            } else {
                setUser(null);
                console.log(' No Pure Native user');
            }

            // Get debug info
            const debug = await pureNativeGoogleSignIn.getDebugInfo();
            setDebugInfo(debug);

        } catch (err: any) {
            console.error(' Check Pure Native auth error:', err);
            setError(err.message || 'Lỗi kiểm tra Pure Native auth');
            setIsSignedIn(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = useCallback(async () => {
        if (!isConfigured) {
            setError('Pure Native Google Sign-In chưa được cấu hình');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            console.log(' Starting Pure Native Sign-In...');
            console.log(' NO Web Client ID');
            console.log(' Android Client ID + SHA-1 ONLY');

            const result = await pureNativeGoogleSignIn.signIn();

            if (result.success && result.user) {
                setUser(result.user);
                setIsSignedIn(true);
                console.log(' Pure Native Sign-in successful:', result.user.name);

                // Update debug info
                const debug = await pureNativeGoogleSignIn.getDebugInfo();
                setDebugInfo(debug);
            } else {
                setError(result.error || 'Pure Native đăng nhập thất bại');
                setIsSignedIn(false);
                setUser(null);
                console.log(' Pure Native Sign-in failed:', result.error);
            }
        } catch (err: any) {
            console.error(' Pure Native Sign-in error:', err);
            setError(err.message || 'Lỗi Pure Native đăng nhập');
            setIsSignedIn(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [isConfigured]);

    const signOut = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log(' Pure Native Sign-Out...');
            const success = await pureNativeGoogleSignIn.signOut();

            if (success) {
                setUser(null);
                setIsSignedIn(false);
                console.log(' Pure Native Sign-out successful');

                // Update debug info
                const debug = await pureNativeGoogleSignIn.getDebugInfo();
                setDebugInfo(debug);
            } else {
                setError('Pure Native đăng xuất thất bại');
            }
        } catch (err: any) {
            console.error(' Pure Native Sign-out error:', err);
            setError(err.message || 'Lỗi Pure Native đăng xuất');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const revokeAccess = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log(' Revoking Pure Native access...');
            const success = await pureNativeGoogleSignIn.revokeAccess();

            if (success) {
                setUser(null);
                setIsSignedIn(false);
                console.log(' Pure Native access revoked');

                // Update debug info
                const debug = await pureNativeGoogleSignIn.getDebugInfo();
                setDebugInfo(debug);
            } else {
                setError('Pure Native thu hồi quyền thất bại');
            }
        } catch (err: any) {
            console.error(' Pure Native revoke error:', err);
            setError(err.message || 'Lỗi Pure Native thu hồi quyền');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            setError(null);
            console.log(' Refreshing Pure Native user...');

            const currentUser = await pureNativeGoogleSignIn.getCurrentUser();
            const signedIn = await pureNativeGoogleSignIn.isSignedIn();

            setUser(currentUser);
            setIsSignedIn(signedIn);

            // Update debug info
            const debug = await pureNativeGoogleSignIn.getDebugInfo();
            setDebugInfo(debug);

            console.log(' Pure Native user refreshed:', currentUser?.name);
        } catch (err: any) {
            console.error(' Refresh Pure Native user error:', err);
            setError(err.message || 'Lỗi làm mới Pure Native user');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        isLoading,
        isSignedIn,
        isConfigured,
        error,
        signIn,
        signOut,
        revokeAccess,
        refreshUser,
        clearError,
        debugInfo,
        configStatus,
    };
};

export default usePureNativeGoogleSignIn;