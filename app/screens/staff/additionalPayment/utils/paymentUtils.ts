import { Alert } from 'react-native';
import { ADDITIONAL_FEES } from '../constants/additionalFees';
import type { PaymentResponse } from '../types/additionalPaymentTypes';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const calculateTotal = (selectedFees: string[], overtimeHours: number): number => {
    return selectedFees.reduce((total, feeId) => {
        const fee = ADDITIONAL_FEES.find(f => f.id === feeId);
        if (!fee) return total;
        if (feeId === 'overtime') {
            return total + fee.amount * overtimeHours;
        }
        return total + fee.amount;
    }, 0);
};

export const buildPaymentDescription = (selectedFees: string[], overtimeHours: number): string => {
    return selectedFees
        .map(feeId => {
            const fee = ADDITIONAL_FEES.find(f => f.id === feeId);
            if (feeId === 'overtime') {
                return `${fee?.name} (${overtimeHours}h)`;
            }
            return fee?.name;
        })
        .join(', ');
};

export const createAdditionalPayment = async (
    bookingId: string,
    description: string,
    amount: number
): Promise<PaymentResponse> => {
    // Divide the amount by 10 before sending to PayOS as requested
    const payosAmount = Math.round(amount / 10);

    console.log('Additional Payment: Original amount:', amount, 'VND');
    console.log('Additional Payment: PayOS amount (divided by 10):', payosAmount, 'VND');

    const response = await fetch(
        'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/CreateAdditionalPayment',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            body: JSON.stringify({
                bookingId: bookingId,
                description: description,
                amount: payosAmount, // Send the divided amount to PayOS
            }),
        },
    );

    if (!response.ok) {
        throw new Error('Failed to create additional payment');
    }

    const data = await response.json();
    return data;
};

export const isPaymentRedirectUrl = (url: string): boolean => {
    return url.includes('cra-morent.vercel.app') ||
        url.includes('payment-success') ||
        url.includes('payment-cancel') ||
        url.includes('success=true') ||
        url.includes('cancel=true') ||
        url.includes('status=CANCELLED') ||
        url.includes('status=PAID') ||
        url.includes('/success/') ||
        url.includes('/cancel/') ||
        url.includes('/failure/');
};

export const isSuccessUrl = (url: string): boolean => {
    return url.includes('success=true') ||
        url.includes('status=PAID') ||
        url.includes('/success/') ||
        url.includes('payment-success');
};

export const isCancelUrl = (url: string): boolean => {
    return url.includes('cancel=true') ||
        url.includes('status=CANCELLED') ||
        url.includes('/cancel/') ||
        url.includes('/failure/') ||
        url.includes('payment-cancel');
};

export const isPayOSUrl = (url: string): boolean => {
    return url.includes('pay.payos.vn') || url.includes('payos.vn');
};

export const handlePaymentResult = (
    url: string,
    onNavigateToReturn?: () => void
): void => {
    const isSuccess = isSuccessUrl(url);
    const isCancel = isCancelUrl(url);

    if (isSuccess) {
        console.log(' Payment completed successfully!');
        Alert.alert(
            'Payment Successful',
            'Additional payment has been completed successfully! Proceeding to vehicle return.',
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        onNavigateToReturn?.();
                    }
                }
            ]
        );
    } else if (isCancel) {
        console.log(' Payment cancelled or failed');
        Alert.alert(
            'Payment Cancelled',
            'Payment was cancelled by the customer. No additional fees were charged. Proceeding to vehicle return.',
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        onNavigateToReturn?.();
                    }
                }
            ]
        );
    } else {
        console.log(' Payment process completed');
        Alert.alert(
            'Payment Process Finished',
            'Payment process has finished. Proceeding to vehicle return.',
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        onNavigateToReturn?.();
                    }
                }
            ]
        );
    }
};