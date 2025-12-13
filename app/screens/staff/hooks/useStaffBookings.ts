import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { bookingsService } from '../../../../lib/api/services/bookings.service';
import { paymentService } from '../../../../lib/api/services/payment.service';
import type { NavigatorParamList } from '../../../navigators/navigation-route';
import {
    fetchCarDetails,
    fetchCustomerName,
    fetchPaymentDetails,
    fetchCheckInOutStatus,
    mapBookingStatus,
    formatBookingDate,
    fetchBookingWithCarDetails,
    fetchBookingExtensionInfo,
} from '../utils/staffHelpers';
import { bookingExtensionService } from '../../../../lib/api/services/bookingExtension.service';
import type { BookingItem, PaymentStatus } from '../types/staffTypes';

export function useStaffBookings() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookings, setBookings] = useState<BookingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [processingExtensionPayment, setProcessingExtensionPayment] = useState<string | null>(null);

    const mapSingleBooking = async (booking: any): Promise<BookingItem> => {
        console.log(`📋 mapSingleBooking: processing booking ${booking.id} with bookingNumber: ${booking.bookingNumber}`);

        const mappedStatus = mapBookingStatus(booking.status);
        const formattedDate = formatBookingDate(booking.bookingDate);


        let carDetails = {
            carName: 'Unknown Car',
            carBrand: '',
            carModel: '',
            carLicensePlate: '',
            carImage: '',
        };

        if (booking.bookingNumber) {
            try {
                const detailedBooking = await fetchBookingWithCarDetails(booking.bookingNumber);
                if (detailedBooking && detailedBooking.car) {
                    carDetails = {
                        carName: `${detailedBooking.car.manufacturer} ${detailedBooking.car.model}`,
                        carBrand: detailedBooking.car.manufacturer || '',
                        carModel: detailedBooking.car.model || '',
                        carLicensePlate: detailedBooking.car.licensePlate || '',
                        carImage: detailedBooking.car.imageUrls?.[0] || '',
                    };
                }
            } catch (err) {
                console.log(`📋 Failed to fetch detailed booking for ${booking.bookingNumber}, falling back to carId`);

                if (booking.carId) {
                    carDetails = await fetchCarDetails(booking.carId);
                }
            }
        } else if (booking.carId) {
            carDetails = await fetchCarDetails(booking.carId);
        }

        console.log(`📋 mapSingleBooking: car details for booking ${booking.id}:`, carDetails);

        const customerName = booking.userId
            ? await fetchCustomerName(booking.userId)
            : 'Customer';

        const paymentDetails = await fetchPaymentDetails(booking.id);
        let invoiceAmount = paymentDetails.amount;
        let invoiceStatus = paymentDetails.status;

        if (invoiceAmount === 0 && booking.totalPrice > 0) {
            invoiceAmount = booking.totalPrice;
        }

        if (mappedStatus === 'successfully' && invoiceStatus === 'pending') {
            invoiceStatus = 'paid';
        }

        const { hasCheckIn, hasCheckOut } = await fetchCheckInOutStatus(booking.id);


        const extensionInfo = await fetchBookingExtensionInfo(booking.id);
        console.log(` mapSingleBooking: extension info for booking ${booking.id}:`, extensionInfo);

        return {
            id: booking.id,
            bookingNumber: booking.bookingNumber,
            carId: booking.carId,
            ...carDetails,
            customerName,
            userId: booking.userId,
            invoiceId: booking.invoiceId,
            amount: invoiceAmount,
            invoiceStatus,
            status: mappedStatus,
            date: formattedDate,
            hasCheckIn,
            hasCheckOut,

            hasExtension: extensionInfo.hasExtension,
            extensionDescription: extensionInfo.extensionDescription,
            extensionDays: extensionInfo.extensionDays,
            extensionAmount: extensionInfo.extensionAmount,
        };
    };

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        const result = await bookingsService.getAllBookings();

        if (result.error) {
            setError(result.error.message);
            setLoading(false);
            return;
        }

        if (result.data) {
            console.log(` fetchBookings: received ${result.data.length} bookings`);
            console.log(` fetchBookings: sample booking data:`, result.data[0]);

            const mappedBookingsPromises = result.data.map(mapSingleBooking);
            const mappedBookings = await Promise.all(mappedBookingsPromises);
            setBookings(mappedBookings);
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('StaffScreen focused - refreshing bookings...');
            fetchBookings();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleRequestPayment = async (bookingId: string) => {
        try {
            setProcessingPayment(bookingId);

            const result = await paymentService.createRentalPayment(bookingId);

            if (result.error) {
                alert(`Failed to create payment: ${result.error.message}`);
                setProcessingPayment(null);
                return;
            }

            if (result.data && result.data.checkoutUrl) {
                navigation.navigate('PayOSWebView' as any, {
                    paymentUrl: result.data.checkoutUrl,
                    bookingId: bookingId,
                    returnScreen: 'StaffScreen',
                });
            } else {
                alert('Failed to create payment: No checkout URL received');
            }

            setProcessingPayment(null);
        } catch (error) {
            alert(
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            setProcessingPayment(null);
        }
    };

    const handlePayExtension = async (bookingId: string) => {
        try {
            setProcessingExtensionPayment(bookingId);
            console.log(' Starting extension payment for booking:', bookingId);

            const result = await bookingExtensionService.getBookingExtensionPaymentUrl(bookingId);

            if (result.error || !result.data) {
                alert(`Failed to create extension payment: ${result.error?.message || 'Unknown error'}`);
                setProcessingExtensionPayment(null);
                return;
            }

            console.log(' Extension payment URL created:', result.data.checkoutUrl);


            navigation.navigate('PayOSWebView' as any, {
                paymentUrl: result.data.checkoutUrl,
                bookingId: bookingId,
                returnScreen: 'StaffScreen',
            });

            setProcessingExtensionPayment(null);
        } catch (error) {
            console.error('💳 Error creating extension payment:', error);
            alert(
                `Extension Payment Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            setProcessingExtensionPayment(null);
        }
    };

    const filteredPayments = bookings.filter(payment => {
        const matchesStatus =
            statusFilter === 'all' || payment.status === statusFilter;

        if (!searchQuery || searchQuery.trim() === '') {
            return matchesStatus;
        }

        const normalizedQuery = searchQuery.toLowerCase().trim();

        const matchesSearch =
            payment.carName.toLowerCase().includes(normalizedQuery) ||
            payment.customerName.toLowerCase().includes(normalizedQuery) ||
            payment.id.toLowerCase().includes(normalizedQuery) ||
            (payment.bookingNumber && payment.bookingNumber.toLowerCase().includes(normalizedQuery));

        return matchesStatus && matchesSearch;
    });


    if (searchQuery && searchQuery.trim() !== '') {
        console.log('🔍 Search Results:', {
            query: searchQuery,
            totalBookings: bookings.length,
            filteredCount: filteredPayments.length,
            sampleBookingNumbers: bookings.slice(0, 3).map(b => b.bookingNumber),
        });
    }

    return {

        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        bookings,
        loading,
        refreshing,
        error,
        processingPayment,
        processingExtensionPayment,
        filteredPayments,


        onRefresh,
        handleRequestPayment,
        handlePayExtension,
        fetchBookings,
        navigation,
    };
}