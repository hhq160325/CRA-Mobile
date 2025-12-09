import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";

export const forgotPassword = async (
    email: string,
    phone?: string
): Promise<{ data: { message: string } | null; error: Error | null }> => {
    console.log("passwordResetService.forgotPassword: sending request for", email, phone ? "with phone verification" : "");

    const requestBody: any = { email };
    if (phone) {
        requestBody.phone = phone;
    }

    const result = await apiClient<{ message: string }>(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: "POST",
        body: JSON.stringify(requestBody),
    });

    console.log("passwordResetService.forgotPassword: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
    });

    if (result.error) {
        console.error("passwordResetService.forgotPassword: error details", result.error);
        return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
};

export const verifyResetCode = async (
    email: string,
    code: string
): Promise<{ data: { valid: boolean } | null; error: Error | null }> => {
    console.log("passwordResetService.verifyResetCode: verifying code for", email);

    const result = await apiClient<{ valid: boolean }>(API_ENDPOINTS.VERIFY_RESET_CODE, {
        method: "POST",
        body: JSON.stringify({ email, code }),
    });

    console.log("passwordResetService.verifyResetCode: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
    });

    if (result.error) {
        console.error("passwordResetService.verifyResetCode: error details", result.error);
        return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
};

export const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
): Promise<{ data: { message: string } | null; error: Error | null }> => {
    console.log("passwordResetService.resetPassword: resetting password for", email);

    const result = await apiClient<{ message: string }>(API_ENDPOINTS.RESET_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
    });

    console.log("passwordResetService.resetPassword: received response", {
        hasError: !!result.error,
        hasData: !!result.data,
    });

    if (result.error) {
        console.error("passwordResetService.resetPassword: error details", result.error);
        return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
};
