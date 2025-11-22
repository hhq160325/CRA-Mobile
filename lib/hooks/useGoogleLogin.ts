import { useState } from "react"
import { performGoogleLogin } from "../utils/googleLogin"

export function useGoogleLogin() {
    const [isLoading, setIsLoading] = useState(false)

    const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; user?: any }> => {
        setIsLoading(true)
        try {
            const result = await performGoogleLogin()
            return result
        } catch (error: any) {
            console.error("❌ Google login error:", error)
            return {
                success: false,
                error: error.message || "An error occurred during Google login",
            }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        loginWithGoogle,
        isLoading,
    }
}
