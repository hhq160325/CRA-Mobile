// Export types
export type {
    Payment,
    Invoice,
    InvoiceItem,
    CreateInvoiceData,
    UpdateInvoiceData,
    PayOSPayment,
    CreatePayOSPaymentRequest,
    PaymentIntent,
    CreatePaymentData,
    RefundData,
    PaymentHistory,
} from './payment/types';

// Import service functions
import { getUserById } from './payment/userService';
import {
    getAllInvoices,
    getInvoicesByCustomer,
    getInvoicesByVendor,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    completeInvoice,
    failInvoice,
    getPaymentsByInvoice,
} from './payment/invoiceService';
import {
    getPayOSPayment,
    createPayOSPayment,
    createRentalPayment,
    updateRentalPaymentCash,
} from './payment/payosService';
import {
    createPaymentIntent,
    createPayment,
    createPaymentFromInvoice,
    getPaymentById,
    getPaymentByOrderCode,
    getPaymentByBookingId,
    getPaymentHistory,
    getAllPayments,
    verifyPayment,
    cancelPayment,
    requestRefund,
    getPaymentReceipt,
    getPaymentStats,
    handlePaymentWebhook,
    getBookingPayments,
} from './payment/paymentService';

// Main payment service object
export const paymentService = {
    // User methods
    getUserById,

    // Invoice methods
    getAllInvoices,
    getInvoicesByCustomer,
    getInvoicesByVendor,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    completeInvoice,
    failInvoice,
    getPaymentsByInvoice,

    // PayOS methods
    getPayOSPayment,
    createPayOSPayment,
    createRentalPayment,
    updateRentalPaymentCash,

    // Payment methods
    createPaymentIntent,
    createPayment,
    createPaymentFromInvoice,
    getPaymentById,
    getPaymentByOrderCode,
    getPaymentByBookingId,
    getPaymentHistory,
    getAllPayments,
    verifyPayment,
    cancelPayment,
    requestRefund,
    getPaymentReceipt,
    getPaymentStats,
    handlePaymentWebhook,
    getBookingPayments,
};
