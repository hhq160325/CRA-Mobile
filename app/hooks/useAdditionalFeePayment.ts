import { useState, useCallback } from 'react';
import { additionalFeePaymentService, type AdditionalFeePayment } from '../../lib/api';

export interface AdditionalFeePaymentState {
    loading: boolean;
    hasAdditionalFee: boolean;
    additionalFeePayment: AdditionalFeePayment | null;
    isPending: boolean;
    error: string | null;
}

export const useAdditionalFeePayment = (bookingId: string) => {
    const [state, setState] = useState<AdditionalFeePaymentState>({
        loading: false,
        hasAdditionalFee: false,
        additionalFeePayment: null,
        isPending: false,
        error: null,
    });

    // Step 1: Check payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!bookingId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await additionalFeePaymentService.checkAdditionalFeePayment(bookingId);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to check additional fee payment status',
                }));
                return;
            }

            const { hasAdditionalFee, additionalFeePayment, isPending } = result.data || {};

            setState(prev => ({
                ...prev,
                loading: false,
                hasAdditionalFee: hasAdditionalFee || false,
                additionalFeePayment: additionalFeePayment || null,
                isPending: isPending || false,
                error: null,
            }));

            return result.data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            }));
        }
    }, [bookingId]);

    // Step 2: Handle PayOS completion
    const handlePayOSCompletion = useCallback(async (paymentUrl: string) => {
        if (!bookingId) return null;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await additionalFeePaymentService.handleAdditionalFeePayOSCompletion(bookingId, paymentUrl);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to handle additional fee payment completion',
                }));
                return null;
            }

            // Refresh payment status after successful update
            if (result.data?.wasUpdated) {
                await checkPaymentStatus();
            }

            setState(prev => ({ ...prev, loading: false }));
            return result.data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            }));
            return null;
        }
    }, [bookingId, checkPaymentStatus]);

    // Step 3: Update payment status manually (for testing or manual updates)
    const updatePaymentStatus = useCallback(async (orderCode: number, status: string = 'Paid') => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await additionalFeePaymentService.updateAdditionalFeePaymentStatus(orderCode, status);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to update additional fee payment status',
                }));
                return false;
            }

            // Refresh payment status after successful update
            await checkPaymentStatus();

            setState(prev => ({ ...prev, loading: false }));
            return result.data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            }));
            return false;
        }
    }, [checkPaymentStatus]);

    return {
        ...state,
        checkPaymentStatus,
        handlePayOSCompletion,
        updatePaymentStatus,
        refresh: checkPaymentStatus,
    };
};