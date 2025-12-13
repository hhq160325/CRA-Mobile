import type { PaymentItem } from '../types/paymentTypes';

export function formatDate(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('en', {
        month: 'short',
    })} ${d.getFullYear()}`;
}

export function getStatusColor(status: string): string {
    return status.toLowerCase() === 'success' ? '#00B050' : '#d97706';
}

export function getStatusBgColor(status: string): string {
    return status.toLowerCase() === 'success' ? '#d1fae5' : '#fef3c7';
}

export function calculateTotal(payments: PaymentItem[]): number {
    return payments
        .filter(payment => payment.status.toLowerCase() === 'success')
        .reduce((sum, payment) => sum + payment.paidAmount, 0);
}

export function getAuthToken(): string | null {
    try {
        if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
            return localStorage.getItem('token');
        }
    } catch (e) {
        console.error('Error getting auth token:', e);
    }
    return null;
}