import { apiClient } from "../../client";
import { API_ENDPOINTS, API_CONFIG } from "../../config";
import type { PayOSPayment, CreatePayOSPaymentRequest } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getPayOSPayment = async (
    orderCode: string
): Promise<{ data: PayOSPayment | null; error: Error | null }> => {
    console.log("payosService.getPayOSPayment: fetching payment", orderCode);
    const result = await apiClient<PayOSPayment>(API_ENDPOINTS.GET_PAYOS_PAYMENT(orderCode), {
        method: "GET",
    });
    console.log("payosService.getPayOSPayment: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const createPayOSPayment = async (
    data: CreatePayOSPaymentRequest
): Promise<{ data: PayOSPayment | null; error: Error | null }> => {
    console.log("payosService.createPayOSPayment: creating payment", data);
    const result = await apiClient<PayOSPayment>(API_ENDPOINTS.CREATE_PAYOS_PAYMENT, {
        method: "POST",
        body: JSON.stringify(data),
    });
    console.log("payosService.createPayOSPayment: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const createRentalPayment = async (
    bookingId: string
): Promise<{ data: any | null; error: Error | null }> => {
    console.log("payosService.createRentalPayment: creating rental payment for booking", bookingId);

    // PayOS endpoint doesn't use /api prefix, so we need to call it directly
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', ''); // Remove /api from base URL
    const fullUrl = `${baseUrl}/PayOS/Booking/CreateRentalPayment`;

    console.log("payosService.createRentalPayment: calling", fullUrl);

    try {
        let token: string | null = null;
        try {
            token = await AsyncStorage.getItem("token");
        } catch (e) {
            console.error("Failed to get token:", e);
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ bookingId }),
        });

        console.log("payosService.createRentalPayment: response status", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("payosService.createRentalPayment: error", errorText);
            return {
                data: null,
                error: new Error(`Failed to create rental payment: ${response.status}`),
            };
        }

        const data = await response.json();
        console.log("payosService.createRentalPayment: success", data);
        return { data, error: null };
    } catch (error: any) {
        console.error("payosService.createRentalPayment: exception", error);
        return {
            data: null,
            error: new Error(error?.message || "Failed to create rental payment"),
        };
    }
};

export const updateRentalPaymentCash = async (
    bookingId: string
): Promise<{ data: any | null; error: Error | null }> => {
    console.log("payosService.updateRentalPaymentCash: updating booking payment for booking", bookingId);

    // Use UpdatePayment/Booking/BookingPayment endpoint without /api prefix
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/UpdatePayment/Booking/BookingPayment`;

    console.log("payosService.updateRentalPaymentCash: calling", fullUrl);

    try {
        let token: string | null = null;
        try {
            token = await AsyncStorage.getItem("token");
        } catch (e) {
            console.error("Failed to get token:", e);
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({
                bookingId,
                paymentMethod: "Cash on Delivery",
                status: "Success",
            }),
        });

        console.log("payosService.updateRentalPaymentCash: response status", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("payosService.updateRentalPaymentCash: error", errorText);
            return {
                data: null,
                error: new Error(`Failed to update payment: ${response.status}`),
            };
        }

        const data = await response.json();
        console.log("payosService.updateRentalPaymentCash: success", data);
        return { data, error: null };
    } catch (error: any) {
        console.error("payosService.updateRentalPaymentCash: exception", error);
        return {
            data: null,
            error: new Error(error?.message || "Failed to update payment"),
        };
    }
};
