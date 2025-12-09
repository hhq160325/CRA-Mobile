/**
 * Calculate rental days based on pickup and drop-off dates/times
 */
export const calculateRentalDays = (
    pickupDate: string,
    pickupTime: string,
    dropoffDate: string,
    dropoffTime: string
): number => {
    if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
        return 1; // Default to 1 day if dates not set
    }

    try {
        const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
        const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}:00`);

        if (isNaN(pickupDateTime.getTime()) || isNaN(dropoffDateTime.getTime())) {
            return 1;
        }

        const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);

        // Round up to nearest day (minimum 1 day)
        return Math.max(1, Math.ceil(durationDays));
    } catch (error) {
        console.error('Error calculating rental days:', error);
        return 1;
    }
};

/**
 * Calculate shipping fee based on distance
 */
export const calculateShippingFee = (
    pickupMode: string,
    distanceInKm: number | null
): number => {
    return pickupMode === 'custom' && distanceInKm
        ? Math.round(distanceInKm * 20000)
        : 0;
};

/**
 * Calculate booking fee (15% of subtotal + shipping)
 */
export const calculateBookingFee = (
    subtotal: number,
    shippingFee: number
): number => {
    return Math.round(subtotal * 0.15) + shippingFee;
};

/**
 * Calculate total price
 */
export const calculateTotal = (
    subtotal: number,
    shippingFee: number,
    discount: number
): number => {
    return subtotal + shippingFee - discount;
};
