import { useState, useCallback } from "react"
import { Platform } from "react-native"
import Constants from 'expo-constants'

export function useGoogleLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; user?: any }> => {
        setIsLoading(true)
        setError(null)

        try {
            console.log("useGoogleLogin: Checking environment")

            // Check if we're in a development build or bare workflow
            const appOwnership = Constants.appOwnership
            const executionEnvironment = Constants.executionEnvironment

            console.log("useGoogleLogin: App ownership:", appOwnership)
            console.log("useGoogleLogin: Execution environment:", executionEnvironment)

            // Only block if we're actually in Expo Go
            if (appOwnership === 'expo' && executionEnvironment === 'storeClient') {
                const errorMessage = "Google Sign-In requires a development build. Please use 'npx expo run:android' or build with EAS."
                console.log("useGoogleLogin: Expo Go detected:", errorMessage)
                setError(errorMessage)
                return { success: false, error: errorMessage }
            }

            // Try to dynamically import the Google Sign-In service
            try {
                const { pureNativeGoogleSignIn } = await import("../../app/services/PureNativeGoogleSignIn")

                console.log("useGoogleLogin: Starting Pure Native Google Sign-In")

                // Configure Google Sign-In if not already configured
                const configured = pureNativeGoogleSignIn.configure()
                if (!configured) {
                    const errorMessage = "Google Sign-In not configured. Please add GOOGLE_ANDROID_CLIENT_ID to .env file"
                    console.log("useGoogleLogin: Configuration failed:", errorMessage)
                    setError(errorMessage)
                    return { success: false, error: errorMessage }
                }

                // Perform sign-in
                const result = await pureNativeGoogleSignIn.signIn()

                if (result.success && result.user) {
                    console.log("useGoogleLogin: Sign-in successful")
                    return { success: true, user: result.user }
                } else {
                    const errorMessage = result.error || "Google Sign-In failed"
                    console.log("useGoogleLogin: Sign-in failed:", errorMessage)
                    setError(errorMessage)
                    return { success: false, error: errorMessage }
                }
            } catch (importError: any) {
                const errorMessage = "Google Sign-In native module not available. Please use a development build."
                console.log("useGoogleLogin: Import failed:", importError.message)
                setError(errorMessage)
                return { success: false, error: errorMessage }
            }
        } catch (err: any) {
            console.error("useGoogleLogin: Exception -", err)
            const errorMessage = err.message || "An error occurred during Google login"
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        loginWithGoogle,
        isLoading,
        error,
        clearError,
        isReady: true,
        redirectUri: '',
    }
}
