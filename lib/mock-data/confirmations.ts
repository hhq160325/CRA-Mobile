// Mock confirmation storage for pickup and return
interface Confirmation {
    paymentId: string
    pickupConfirmed: boolean
    returnConfirmed: boolean
    pickupImage?: string
    returnImage?: string
    pickupDate?: Date
    returnDate?: Date
}

// In-memory storage (in production, this would be in a database or AsyncStorage)
const confirmations: Map<string, Confirmation> = new Map()

export const confirmationService = {
    // Get confirmation status for a payment
    getConfirmation(paymentId: string): Confirmation {
        return confirmations.get(paymentId) || {
            paymentId,
            pickupConfirmed: false,
            returnConfirmed: false,
        }
    },

    // Confirm pickup
    confirmPickup(paymentId: string, imageUri: string) {
        const existing = this.getConfirmation(paymentId)
        confirmations.set(paymentId, {
            ...existing,
            pickupConfirmed: true,
            pickupImage: imageUri,
            pickupDate: new Date(),
        })
    },

    // Confirm return
    confirmReturn(paymentId: string, imageUri: string) {
        const existing = this.getConfirmation(paymentId)
        confirmations.set(paymentId, {
            ...existing,
            returnConfirmed: true,
            returnImage: imageUri,
            returnDate: new Date(),
        })
    },

    // Check if both pickup and return are confirmed
    isFullyConfirmed(paymentId: string): boolean {
        const confirmation = this.getConfirmation(paymentId)
        return confirmation.pickupConfirmed && confirmation.returnConfirmed
    },

    // Get all confirmations
    getAllConfirmations(): Confirmation[] {
        return Array.from(confirmations.values())
    },
}
