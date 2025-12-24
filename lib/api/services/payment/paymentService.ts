import { apiClient } from "../../client";
import { API_ENDPOINTS, API_CONFIG } from "../../config";
import type {
    Payment,
    PaymentIntent,
    CreatePaymentData,
    RefundData,
    PaymentHistory,
    PaymentStats,
} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createPaymentIntent = async (
    bookingId: string,
    amount: number
): Promise<{ data: PaymentIntent | null; error: Error | null }> => {
    const result = await apiClient<PaymentIntent>(API_ENDPOINTS.PAYMENT_INTENT, {
        method: "POST",
        body: JSON.stringify({ bookingId, amount }),
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const createPayment = async (
    data: CreatePaymentData
): Promise<{ data: Payment | null; error: Error | null }> => {
    const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const createPaymentFromInvoice = async (
    invoiceId: string
): Promise<{ data: Payment | null; error: Error | null }> => {
    console.log("paymentService.createPaymentFromInvoice: creating payment for invoice", invoiceId);
    const result = await apiClient<Payment>(API_ENDPOINTS.CREATE_PAYMENT_FROM_INVOICE(invoiceId), {
        method: "POST",
    });
    console.log("paymentService.createPaymentFromInvoice: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentById = async (
    paymentId: string
): Promise<{ data: Payment | null; error: Error | null }> => {
    const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_DETAILS(paymentId), {
        method: "GET",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentByOrderCode = async (
    orderCode: string
): Promise<{ data: Payment | null; error: Error | null }> => {
    console.log("paymentService.getPaymentByOrderCode: fetching payment", orderCode);

    // Try the Payment endpoint without /api prefix first (matching PayOS pattern)
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/Payment/${orderCode}`;

    console.log("paymentService.getPaymentByOrderCode: calling", fullUrl);

    try {
        let token: string | null = null;
        try {
            token = await AsyncStorage.getItem("token");
        } catch (e) {
            console.error("Failed to get token:", e);
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "accept": "*/*",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
            method: "GET",
            headers,
        });

        console.log("paymentService.getPaymentByOrderCode: response status", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("paymentService.getPaymentByOrderCode: error", errorText);
            return {
                data: null,
                error: new Error(`Failed to get payment: ${response.status}`),
            };
        }

        const data = await response.json();
        console.log("paymentService.getPaymentByOrderCode: success", data);
        return { data, error: null };
    } catch (error: any) {
        console.error("paymentService.getPaymentByOrderCode: exception", error);
        return {
            data: null,
            error: new Error(error?.message || "Failed to get payment"),
        };
    }
};

export const getPaymentByBookingId = async (
    bookingId: string
): Promise<{ data: Payment | null; error: Error | null }> => {
    const result = await apiClient<Payment>(API_ENDPOINTS.PAYMENT_BY_BOOKING(bookingId), {
        method: "GET",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentHistory = async (
    userId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ data: PaymentHistory | null; error: Error | null }> => {
    const result = await apiClient<PaymentHistory>(
        `${API_ENDPOINTS.PAYMENT_HISTORY}?userId=${userId}&page=${page}&pageSize=${pageSize}`,
        {
            method: "GET",
        }
    );
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getAllPayments = async (
    page: number = 1,
    pageSize: number = 20,
    status?: string
): Promise<{ data: PaymentHistory | null; error: Error | null }> => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });
    if (status) params.append("status", status);

    const result = await apiClient<PaymentHistory>(`${API_ENDPOINTS.ALL_PAYMENTS}?${params}`, {
        method: "GET",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const verifyPayment = async (
    paymentId: string
): Promise<{ data: Payment | null; error: Error | null }> => {
    const result = await apiClient<Payment>(API_ENDPOINTS.VERIFY_PAYMENT(paymentId), {
        method: "POST",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const cancelPayment = async (paymentId: string): Promise<{ error: Error | null }> => {
    const result = await apiClient(API_ENDPOINTS.CANCEL_PAYMENT(paymentId), {
        method: "POST",
    });
    return { error: result.error };
};

export const requestRefund = async (
    data: RefundData
): Promise<{ data: Payment | null; error: Error | null }> => {
    const result = await apiClient<Payment>(API_ENDPOINTS.REFUND_PAYMENT, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentReceipt = async (
    paymentId: string
): Promise<{ data: { receiptUrl: string } | null; error: Error | null }> => {
    const result = await apiClient<{ receiptUrl: string }>(API_ENDPOINTS.PAYMENT_RECEIPT(paymentId), {
        method: "GET",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentStats = async (
    ownerId: string,
    startDate?: string,
    endDate?: string
): Promise<{ data: PaymentStats | null; error: Error | null }> => {
    const params = new URLSearchParams({ ownerId });
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const result = await apiClient<PaymentStats>(`${API_ENDPOINTS.PAYMENT_STATS}?${params}`, {
        method: "GET",
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const handlePaymentWebhook = async (webhookData: any): Promise<{ error: Error | null }> => {
    const result = await apiClient(API_ENDPOINTS.PAYMENT_WEBHOOK, {
        method: "POST",
        body: JSON.stringify(webhookData),
    });
    return { error: result.error };
};

export const getBookingPayments = async (
    bookingId: string
): Promise<{ data: any[] | null; error: Error | null }> => {
    console.log("paymentService.getBookingPayments: fetching payments for booking", bookingId);

    // Try direct fetch without /api prefix (matching your curl command)
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/Booking/${bookingId}/Payments`;

    console.log("paymentService.getBookingPayments: calling URL", fullUrl);

    try {
        let token: string | null = null;
        try {
            token = await AsyncStorage.getItem("token");
        } catch (e) {
            console.error("Failed to get token:", e);
        }

        const headers: Record<string, string> = {
            'accept': '*/*',
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log("paymentService.getBookingPayments: headers", { hasAuth: !!token });

        const response = await fetch(fullUrl, {
            method: "GET",
            headers,
        });

        console.log("paymentService.getBookingPayments: response status", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("paymentService.getBookingPayments: error response", errorText);
            return { data: null, error: new Error(`Failed to fetch payments: ${response.status}`) };
        }

        const data = await response.json();
        console.log("paymentService.getBookingPayments: success", {
            dataLength: Array.isArray(data) ? data.length : 0,
            payments: data,
        });
        return { data, error: null };
    } catch (error: any) {
        console.error("paymentService.getBookingPayments: exception", error);
        return { data: null, error: new Error(error?.message || "Failed to fetch payments") };
    }
};
