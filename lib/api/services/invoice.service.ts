import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

// Invoice Response from API
interface ApiInvoiceResponse {
    id: string
    amount: number
    status: string
    createDate: string
    updateDate: string
    customerId: string
    vendorId: string
    bookingId?: string
    description?: string
    dueDate?: string
    paidDate?: string
}

export interface Invoice {
    id: string
    amount: number
    status: string
    createDate: string
    updateDate: string
    customerId: string
    vendorId: string
    bookingId?: string
    description?: string
    dueDate?: string
    paidDate?: string
}

// Map API response to app Invoice model
function mapApiInvoiceToInvoice(apiInvoice: ApiInvoiceResponse): Invoice {
    return {
        id: apiInvoice.id,
        amount: apiInvoice.amount,
        status: apiInvoice.status,
        createDate: apiInvoice.createDate,
        updateDate: apiInvoice.updateDate,
        customerId: apiInvoice.customerId,
        vendorId: apiInvoice.vendorId,
        bookingId: apiInvoice.bookingId,
        description: apiInvoice.description,
        dueDate: apiInvoice.dueDate,
        paidDate: apiInvoice.paidDate,
    }
}

export const invoiceService = {
    async getInvoiceById(invoiceId: string): Promise<{ data: Invoice | null; error: Error | null }> {
        console.log("invoiceService.getInvoiceById: fetching invoice", invoiceId)
        const result = await apiClient<ApiInvoiceResponse>(API_ENDPOINTS.GET_INVOICE(invoiceId), { method: "GET" })
        console.log("invoiceService.getInvoiceById: result", { hasError: !!result.error, hasData: !!result.data })

        if (result.error) {
            return { data: null, error: result.error }
        }

        const mappedData = result.data ? mapApiInvoiceToInvoice(result.data) : null
        return { data: mappedData, error: null }
    },

    async getAllInvoices(): Promise<{ data: Invoice[] | null; error: Error | null }> {
        console.log("invoiceService.getAllInvoices: fetching all invoices")
        const result = await apiClient<ApiInvoiceResponse[]>(API_ENDPOINTS.ALL_INVOICES, { method: "GET" })
        console.log("invoiceService.getAllInvoices: result", { hasError: !!result.error, dataLength: result.data?.length })

        if (result.error) {
            return { data: null, error: result.error }
        }

        const mappedData = result.data?.map(mapApiInvoiceToInvoice) || null
        return { data: mappedData, error: null }
    },

    async getInvoicesByCustomer(customerId: string): Promise<{ data: Invoice[] | null; error: Error | null }> {
        console.log("invoiceService.getInvoicesByCustomer: fetching invoices for customer", customerId)
        const result = await apiClient<ApiInvoiceResponse[]>(API_ENDPOINTS.INVOICES_BY_CUSTOMER(customerId), { method: "GET" })
        console.log("invoiceService.getInvoicesByCustomer: result", { hasError: !!result.error, dataLength: result.data?.length })

        if (result.error) {
            return { data: null, error: result.error }
        }

        const mappedData = result.data?.map(mapApiInvoiceToInvoice) || null
        return { data: mappedData, error: null }
    },
}
