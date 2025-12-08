import { useState, useCallback, useEffect } from "react"
import { useGoogleAuth, processGoogleAuthResponse } from "../utils/googleLogin"

export function useGoogleLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Use the expo-auth-session hook
    const { request, response, promptAsync, redirectUri } = useGoogleAuth()

    // Process response when it changes
    useEffect(() => {
        if (response) {
            handleResponse(response)
        }
    }, [response])

    const handleResponse = async (authResponse: any) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log("useGoogleLogin: Processing auth response...", authResponse?.type)
            const result = await processGoogleAuthResponse(authResponse)

            if (result.success) {
                console.log("useGoogleLogin: Login successful")
                return result
            } else {
                console.log("useGoogleLogin: Login failed -", result.error)
                if (result.error !== "Login cancelled") {
                    setError(result.error || "Login failed")
                }
                return result
            }
        } catch (err: any) {
            console.error("useGoogleLogin: Exception -", err)
            const errorMessage = err.message || "An error occurred during Google login"
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }

    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; user?: any }> => {
        setIsLoading(true)
        setError(null)

        try {
            console.log("useGoogleLogin: Starting Google Sign-In...")
            console.log("useGoogleLogin: Redirect URI:", redirectUri)

            if (!request) {
                console.log("useGoogleLogin: Request not ready yet")
                setError("Google Sign-In is not ready. Please try again.")
                return { success: false, error: "Google Sign-In is not ready" }
            }

            // Trigger the Google auth prompt
            const result = await promptAsync()
            console.log("useGoogleLogin: promptAsync result:", result?.type)

            // The response will be handled by the useEffect above
            if (result?.type === 'success') {
                const processResult = await processGoogleAuthResponse(result)
                return processResult
            } else if (result?.type === 'cancel') {
                return { success: false, error: "Login cancelled" }
            } else {
                return { success: false, error: "Authentication failed" }
            }

        } catch (err: any) {
            console.error("useGoogleLogin: Exception -", err)
            const errorMessage = err.message || "An error occurred during Google login"
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [request, promptAsync, redirectUri])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        loginWithGoogle,
        isLoading,
        error,
        clearError,
        isReady: !!request,
        redirectUri,
    }
}
