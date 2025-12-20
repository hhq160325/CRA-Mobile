import { useState, useCallback } from "react"

// Placeholder hook for native Google login - expo-auth-session removed
export function useGoogleLogin() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string; user?: any }> => {
        setIsLoading(true)
        setError(null)

        try {
            // TODO: Implement native Google login here
            console.log("useGoogleLogin: Native Google login not implemented yet")
            setError("Native Google login not implemented")
            return { success: false, error: "Native Google login not implemented" }
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
        isReady: true, // Always ready for native implementation
        redirectUri: '',
    }
}
