import { apiClient } from "../../client";
import { API_ENDPOINTS } from "../../config";
import type { Invoice, CreateInvoiceData, UpdateInvoiceData } from './types';

export const getAllInvoices = async (): Promise<{ data: Invoice[] | null; error: Error | null }> => {
    console.log("invoiceService.getAllInvoices: fetching all invoices");
    const result = await apiClient<Invoice[]>(API_ENDPOINTS.ALL_INVOICES, {
        method: "GET",
    });
    console.log("invoiceService.getAllInvoices: result", {
        hasError: !!result.error,
        dataLength: result.data?.length,
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getInvoicesByCustomer = async (
    customerId: string
): Promise<{ data: Invoice[] | null; error: Error | null }> => {
    console.log("invoiceService.getInvoicesByCustomer: fetching invoices for customer", customerId);
    const result = await apiClient<Invoice[]>(API_ENDPOINTS.INVOICES_BY_CUSTOMER(customerId), {
        method: "GET",
    });
    console.log("invoiceService.getInvoicesByCustomer: result", {
        hasError: !!result.error,
        dataLength: result.data?.length,
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getInvoicesByVendor = async (
    vendorId: string
): Promise<{ data: Invoice[] | null; error: Error | null }> => {
    console.log("invoiceService.getInvoicesByVendor: fetching invoices for vendor", vendorId);
    const result = await apiClient<Invoice[]>(API_ENDPOINTS.INVOICES_BY_VENDOR(vendorId), {
        method: "GET",
    });
    console.log("invoiceService.getInvoicesByVendor: result", {
        hasError: !!result.error,
        dataLength: result.data?.length,
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getInvoiceById = async (
    invoiceId: string
): Promise<{ data: Invoice | null; error: Error | null }> => {
    console.log("invoiceService.getInvoiceById: fetching invoice", invoiceId);
    const result = await apiClient<Invoice>(API_ENDPOINTS.GET_INVOICE(invoiceId), {
        method: "GET",
    });
    console.log("invoiceService.getInvoiceById: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const createInvoice = async (
    data: CreateInvoiceData
): Promise<{ data: Invoice | null; error: Error | null }> => {
    console.log("invoiceService.createInvoice: creating invoice", data);
    const result = await apiClient<Invoice>(API_ENDPOINTS.CREATE_INVOICE, {
        method: "POST",
        body: JSON.stringify(data),
    });
    console.log("invoiceService.createInvoice: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const updateInvoice = async (
    data: UpdateInvoiceData
): Promise<{ data: Invoice | null; error: Error | null }> => {
    console.log("invoiceService.updateInvoice: updating invoice", data.id);
    const result = await apiClient<Invoice>(API_ENDPOINTS.UPDATE_INVOICE, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    console.log("invoiceService.updateInvoice: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const completeInvoice = async (
    invoiceId: string
): Promise<{ data: Invoice | null; error: Error | null }> => {
    console.log("invoiceService.completeInvoice: completing invoice", invoiceId);
    const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_COMPLETE, {
        method: "PATCH",
        body: JSON.stringify({ id: invoiceId }),
    });
    console.log("invoiceService.completeInvoice: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const failInvoice = async (
    invoiceId: string,
    reason?: string
): Promise<{ data: Invoice | null; error: Error | null }> => {
    console.log("invoiceService.failInvoice: marking invoice as failed", invoiceId);
    const result = await apiClient<Invoice>(API_ENDPOINTS.INVOICE_FAILED, {
        method: "PATCH",
        body: JSON.stringify({ id: invoiceId, reason }),
    });
    console.log("invoiceService.failInvoice: result", { hasError: !!result.error });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};

export const getPaymentsByInvoice = async (
    invoiceId: string
): Promise<{ data: any[] | null; error: Error | null }> => {
    console.log("invoiceService.getPaymentsByInvoice: fetching payments for invoice", invoiceId);
    const result = await apiClient<any[]>(API_ENDPOINTS.GET_INVOICE(invoiceId), {
        method: "GET",
    });
    console.log("invoiceService.getPaymentsByInvoice: result", {
        hasError: !!result.error,
        dataLength: Array.isArray(result.data) ? result.data.length : 0,
    });
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null };
};
