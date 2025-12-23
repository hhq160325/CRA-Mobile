import { Alert } from 'react-native';
import { bookingsService } from '../../../../lib/api';

interface CreateBookingParams {
    userId: string;
    carId: string;
    carPrice: number;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: Date;
    dropoffDateTime: Date;
}


export const createBooking = async (
    params: CreateBookingParams,
    navigation: any
): Promise<void> => {
    const {
        userId,
        carId,
        carPrice,
        pickupLocation,
        dropoffLocation,
        pickupDateTime,
        dropoffDateTime,
    } = params;

    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
        Alert.alert('Error', 'Pick-up and drop-off locations are required');
        return;
    }

    const durationMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
    const rentime = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    if (carPrice <= 0) {
        Alert.alert('Error', 'Invalid car rental price');
        return;
    }

    const bookingData = {
        customerId: String(userId),
        carId: String(carId),
        pickupPlace: String(pickupLocation.trim()),
        pickupTime: pickupDateTime.toISOString(),
        dropoffPlace: String(dropoffLocation.trim()),
        dropoffTime: dropoffDateTime.toISOString(),
        bookingFee: 15,
        carRentPrice: Math.floor(Number(carPrice)),
        rentime: Number(rentime),
        rentType: 'daily',
        request: 'Standard rental request',
    };

    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
    console.log('Data types:', {
        customerId: typeof bookingData.customerId,
        carId: typeof bookingData.carId,
        pickupPlace: typeof bookingData.pickupPlace,
        pickupTime: typeof bookingData.pickupTime,
        dropoffPlace: typeof bookingData.dropoffPlace,
        dropoffTime: typeof bookingData.dropoffTime,
        bookingFee: typeof bookingData.bookingFee,
        carRentPrice: typeof bookingData.carRentPrice,
        rentime: typeof bookingData.rentime,
        rentType: typeof bookingData.rentType,
        request: typeof bookingData.request,
    });

    let res = await bookingsService.createBooking(bookingData);

    if (res.error && res.error.message.includes('Server error')) {
        console.log('First attempt failed, trying without bookingFee...');
        const { bookingFee, ...bookingDataWithoutFee } = bookingData;
        res = await bookingsService.createBooking(bookingDataWithoutFee as any);
    }

    if (res.error) {
        console.error('Booking creation failed:', res.error);
        const errorMessage = res.error?.message || 'Failed to create booking';
        Alert.alert(
            'Error',
            errorMessage +
            '\n\nPlease check your booking details and try again.\n\nIf the problem persists, please contact support with this information:\n- Car ID: ' +
            carId +
            '\n- User ID: ' +
            userId,
        );
        return;
    }

    if (res.data) {
        const bookingResponse = res.data;
        let createdBookingId: string | null = null;
        let payosUrl: string | null = null;

        if (typeof bookingResponse === 'string') {
            payosUrl = bookingResponse;
        } else if (typeof bookingResponse === 'object' && bookingResponse !== null) {
            if (bookingResponse.payment) payosUrl = bookingResponse.payment;
            if (bookingResponse.booking && bookingResponse.booking.id)
                createdBookingId = bookingResponse.booking.id;
            if (!createdBookingId)
                createdBookingId =
                    bookingResponse.bookingId || bookingResponse.id || null;
            if (!payosUrl)
                payosUrl =
                    bookingResponse.paymentUrl || bookingResponse.checkoutUrl || null;
        }

        navigation.navigate('PayOSWebView' as any, {
            paymentUrl: payosUrl,
            bookingId: createdBookingId || 'pending',
        });
    }
};
