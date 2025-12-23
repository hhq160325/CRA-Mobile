import {
    calculateRentalDays,
    calculateShippingFee,
    calculateBookingFee,
    calculateTotal,
} from './calculations';
import type { Car } from '../../../../lib/api';

interface BookingCalculationsProps {
    car: Car | null;
    pickupDate: any;
    pickupTime: string;
    dropoffDate: any;
    dropoffTime: string;
    pickupMode: string;
    distanceInKm: number;
    discount: number;
}

export function useBookingCalculations({
    car,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    pickupMode,
    distanceInKm,
    discount
}: BookingCalculationsProps) {
    const rentalDays = calculateRentalDays(
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime
    );

    const pricePerDay = car ? car.price : 0;
    const subtotal = pricePerDay * rentalDays;
    const shippingFee = calculateShippingFee(pickupMode, distanceInKm);
    const bookingFee = calculateBookingFee(subtotal, shippingFee);
    const total = calculateTotal(subtotal, shippingFee, discount, bookingFee);

    return {
        rentalDays,
        pricePerDay,
        subtotal,
        shippingFee,
        bookingFee,
        total
    };
}