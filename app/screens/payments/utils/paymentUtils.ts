import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaymentItem } from '../types/paymentTypes';

export function formatDate(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('en', {
        month: 'short',
    })} ${d.getFullYear()}`;
}

export function getStatusColor(status: string): string {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'success' || normalizedStatus === 'paid' || normalizedStatus === 'completed') {
        return '#00B050';
    }
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === 'failed') {
        return '#dc2626';
    }
    return '#d97706'; // pending, processing, etc.
}

export function getStatusBgColor(status: string): string {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'success' || normalizedStatus === 'paid' || normalizedStatus === 'completed') {
        return '#d1fae5';
    }
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === 'failed') {
        return '#fee2e2';
    }
    return '#fef3c7'; // pending, processing, etc.
}

export function calculateTotal(payments: PaymentItem[]): number {
    return payments
        .filter(payment => {
            const status = payment.status.toLowerCase();
            return status === 'success' || status === 'paid' || status === 'completed';
        })
        .reduce((sum, payment) => sum + payment.paidAmount, 0);
}

export async function getAuthToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem('token');
    } catch (e) {
        console.error('Error getting auth token:', e);
        return null;
    }
}