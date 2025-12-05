import { apiClient } from "../client"

export interface Confirmation {
    paymentId: string
    pickupConfirmed: boolean
    returnConfirmed: boolean
    pickupImage?: string
    returnImage?: string
    pickupDate?: Date | string
    returnDate?: Date | string
}


const confirmationCache = new Map<string, Confirmation>()

export const confirmationService = {

    getConfirmation(paymentId: string): Confirmation {
        return confirmationCache.get(paymentId) || {
            paymentId,
            pickupConfirmed: false,
            returnConfirmed: false,
        }
    },


    async fetchConfirmation(paymentId: string): Promise<{ data: Confirmation | null; error: Error | null }> {
        const result = await apiClient<Confirmation>(`/confirmations/${paymentId}`, { method: "GET" })
        if (result.data) {
            confirmationCache.set(paymentId, result.data)
        }
        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    async confirmPickup(paymentId: string, imageUri: string): Promise<{ error: Error | null }> {
        const result = await apiClient(`/confirmations/${paymentId}/pickup`, {
            method: "POST",
            body: JSON.stringify({ imageUri }),
        })

        if (!result.error) {
            const existing = this.getConfirmation(paymentId)
            confirmationCache.set(paymentId, {
                ...existing,
                pickupConfirmed: true,
                pickupImage: imageUri,
                pickupDate: new Date().toISOString(),
            })
        }

        return { error: result.error }
    },

    async confirmReturn(paymentId: string, imageUri: string): Promise<{ error: Error | null }> {
        const result = await apiClient(`/confirmations/${paymentId}/return`, {
            method: "POST",
            body: JSON.stringify({ imageUri }),
        })

        if (!result.error) {
            const existing = this.getConfirmation(paymentId)
            confirmationCache.set(paymentId, {
                ...existing,
                returnConfirmed: true,
                returnImage: imageUri,
                returnDate: new Date().toISOString(),
            })
        }

        return { error: result.error }
    },

    isFullyConfirmed(paymentId: string): boolean {
        const confirmation = this.getConfirmation(paymentId)
        return confirmation.pickupConfirmed && confirmation.returnConfirmed
    },

    async fetchAllConfirmations(): Promise<{ data: Confirmation[] | null; error: Error | null }> {
        const result = await apiClient<Confirmation[]>("/confirmations", { method: "GET" })

        if (result.data) {
            result.data.forEach(conf => {
                confirmationCache.set(conf.paymentId, conf)
            })
        }

        return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
    },

    getAllConfirmations(): Confirmation[] {
        return Array.from(confirmationCache.values())
    },
}
