import { apiClient } from '../../client';
import { API_ENDPOINTS } from '../../config';

export interface VerifySignupOtpResponse {
    verified?: boolean;
    valid?: boolean;
    message?: string;
    [key: string]: any;
}


export const verifySignupOtp = async (email: string, otp: string): Promise<{
    data: VerifySignupOtpResponse | null;
    error: Error | null;
}> => {
    try {
        console.log('Verifying signup OTP for:', email, 'OTP:', otp);
        console.log('API endpoint:', `${API_ENDPOINTS.VERIFY_OTP}?email=${encodeURIComponent(email)}&OTPCode=${otp}`);

        const response = await apiClient<VerifySignupOtpResponse>(`${API_ENDPOINTS.VERIFY_OTP}?email=${encodeURIComponent(email)}&OTPCode=${otp}`, {
            method: 'POST',
            body: '',
        });

        console.log('Verify OTP response:', {
            hasError: !!response.error,
            hasData: !!response.data,
            data: response.data,
        });

        if (response.error) {
            return {
                data: null,
                error: response.error,
            };
        }

        return {
            data: response.data,
            error: null,
        };
    } catch (error: any) {
        console.error('Verify signup OTP error:', error);

        const errorMessage = error.message || 'Invalid verification code';

        return {
            data: null,
            error: new Error(errorMessage),
        };
    }
};