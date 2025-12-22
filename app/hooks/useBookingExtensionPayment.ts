import { useState, useCallback } from 'react';
import { bookingExtensionPaymentService, type BookingPayment } from '../../lib/api';

export interface BookingExtensionPaymentState {
    loading: boolean;
    hasExtension: boolean;
    extensionPayment: BookingPayment | null;
    isPending: boolean;
    error: string | null;
}

export const useBookingExtensionPayment = (bookingId: string) => {
    const [state, setState] = useState<BookingExtensionPaymentState>({
        loading: false,
        hasExtension: false,
        extensionPayment: null,
        isPending: false,
        error: null,
    });

    // Step 1: Check payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!bookingId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await bookingExtensionPaymentService.checkBookingExtensionPayment(bookingId);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to check payment status',
                }));
                return;
            }

            const { hasExtension, extensionPayment, isPending } = result.data || {};

            setState(prev => ({
                ...prev,
                loading: false,
                hasExtension: hasExtension || false,
                extensionPayment: extensionPayment || null,
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
            const result = await bookingExtensionPaymentService.handlePayOSCompletion(bookingId, paymentUrl);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to handle payment completion',
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
            const result = await bookingExtensionPaymentService.updatePaymentStatus(orderCode, status);

            if (result.error) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error?.message || 'Failed to update payment status',
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