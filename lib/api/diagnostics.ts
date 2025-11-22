import { testConnection } from "./client"
import { API_CONFIG } from "./config"

export async function runDiagnostics() {
    console.log("=== API Diagnostics ===")
    console.log("Base URL:", API_CONFIG.BASE_URL)
    console.log("Timeout:", API_CONFIG.TIMEOUT, "ms")
    console.log("Retry attempts:", API_CONFIG.RETRY_ATTEMPTS)
    console.log("")

    console.log("Testing connection...")
    const result = await testConnection()

    console.log("Result:", result)
    console.log("=== End Diagnostics ===")

    return result
}
