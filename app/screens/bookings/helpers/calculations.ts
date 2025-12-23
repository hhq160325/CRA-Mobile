
export const calculateRentalDays = (
    pickupDate: string,
    pickupTime: string,
    dropoffDate: string,
    dropoffTime: string
): number => {
    if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
        return 1;
    }

    try {
        const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
        const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}:00`);

        if (isNaN(pickupDateTime.getTime()) || isNaN(dropoffDateTime.getTime())) {
            return 1;
        }

        const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);


        return Math.max(1, Math.ceil(durationDays));
    } catch (error) {
        console.error('Error calculating rental days:', error);
        return 1;
    }
};


export const calculateShippingFee = (
    pickupMode: string,
    distanceInKm: number | null
): number => {
    const fee = pickupMode === 'custom' && distanceInKm
        ? Math.round(distanceInKm * 20000)
        : 0;

    console.log('calculateShippingFee:', {
        pickupMode,
        distanceInKm,
        calculatedFee: fee
    });

    return fee;
};


export const calculateBookingFee = (
    subtotal: number,
    shippingFee: number
): number => {
    return Math.round(subtotal * 0.15);
};


export const calculateTotal = (
    subtotal: number,
    shippingFee: number,
    discount: number,
    bookingFee: number = 0
): number => {
    return shippingFee + bookingFee - discount;
};
