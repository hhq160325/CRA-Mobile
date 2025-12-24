import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { bookingsService } from '../../../../lib/api/services/bookings.service';
import { paymentService } from '../../../../lib/api/services/payment.service';
import type { NavigatorParamList } from '../../../navigators/navigation-route';
import {
    mapBookingStatus,
    formatBookingDate,
    batchFetchCarDetails,
    batchFetchUserDetails,
    batchFetchPaymentDetails,
    batchFetchCheckInOutStatus,
    batchFetchExtensionInfo,
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
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const [loadingProgress, setLoadingProgress] = useState<string>('');

    const mapSingleBooking = async (booking: any, batchData: {
        carDetailsMap: Map<string, any>,
        userDetailsMap: Map<string, any>,
        paymentDetailsMap: Map<string, any>,
        checkInOutMap: Map<string, any>,
        extensionInfoMap: Map<string, any>
    }): Promise<BookingItem> => {
        // console.log(` mapSingleBooking: processing booking ${booking.id} with cached data`);

        let mappedStatus = mapBookingStatus(booking.status);
        const formattedDate = formatBookingDate(booking.bookingDate);

        // Get car details from cache
        let carDetails = batchData.carDetailsMap.get(booking.carId) || {
            carName: 'Unknown Car',
            carBrand: '',
            carModel: '',
            carLicensePlate: '',
            carImage: '',
        };

        // Get customer name from cache
        const customerName = batchData.userDetailsMap.get(booking.userId) || 'Customer';

        // Get payment details from cache
        const paymentDetails = batchData.paymentDetailsMap.get(booking.id) || { amount: 0, status: 'no_payment', hasPaymentRecord: false };
        let invoiceAmount = paymentDetails.amount;
        let invoiceStatus = paymentDetails.status;

        console.log(`🔍 mapSingleBooking: Processing booking ${booking.id} (${booking.bookingNumber})`);
        console.log(`🔍 mapSingleBooking: Payment details:`, paymentDetails);
        console.log(`🔍 mapSingleBooking: Original booking status: ${booking.status}, mapped: ${mappedStatus}`);

        if (invoiceAmount === 0 && booking.totalPrice > 0) {
            invoiceAmount = booking.totalPrice;
        }

        // Determine booking status based on payment requirements
        // Staff screen logic: Check ALL payments but enforce different requirements for different actions
        if (!paymentDetails.hasPaymentRecord || invoiceStatus === 'no_payment') {
            console.log(`🔍 mapSingleBooking: No payment record found for ${booking.id} - setting to pending (need to create rental payment)`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        } else if (paymentDetails.isRentalFeePaid) {
            // If rental fee is paid, booking is ready for pickup/return (depending on extension requirements)
            console.log(`🔍 mapSingleBooking: Rental fee is paid for ${booking.id} - ready for pickup`);
            invoiceStatus = 'paid';
            mappedStatus = 'successfully';
        } else if (paymentDetails.rentalFeePayment && !paymentDetails.isRentalFeePaid) {
            // If rental fee payment exists but not paid, need payment before pickup
            console.log(`🔍 mapSingleBooking: Rental fee is pending for ${booking.id} - payment required for pickup`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        } else {
            // No rental fee payment created yet - need to create payment
            console.log(`🔍 mapSingleBooking: No rental fee payment found for ${booking.id} - need to create payment`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        }

        // Additional status checks for return requirements
        const canPickup = paymentDetails.isRentalFeePaid;
        const canReturn = paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid;
        console.log(`🔍 mapSingleBooking: Action requirements for ${booking.id}: canPickup=${canPickup}, canReturn=${canReturn} (rental paid=${paymentDetails.isRentalFeePaid}, extension paid=${paymentDetails.isExtensionPaid})`);

        console.log(`🔍 mapSingleBooking: Final status for ${booking.id}: ${mappedStatus}, invoice status: ${invoiceStatus}`);

        // Get check-in/out status from cache
        const checkInOutStatus = batchData.checkInOutMap.get(booking.id) || { hasCheckIn: false, hasCheckOut: false };

        // Get extension info from cache
        const extensionInfo = batchData.extensionInfoMap.get(booking.id) || {
            hasExtension: false,
            extensionDescription: undefined,
            extensionDays: undefined,
            extensionAmount: undefined,
            extensionStatus: undefined
        };

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
            hasCheckIn: checkInOutStatus.hasCheckIn,
            hasCheckOut: checkInOutStatus.hasCheckOut,
            hasExtension: extensionInfo.hasExtension,
            extensionDescription: extensionInfo.extensionDescription,
            extensionDays: extensionInfo.extensionDays,
            extensionAmount: extensionInfo.extensionAmount,
            extensionPaymentStatus: extensionInfo.extensionPaymentStatus,
            isExtensionPaymentCompleted: extensionInfo.isExtensionPaymentCompleted,
            // Add payment details for UI logic
            paymentDetails: {
                isBookingFeePaid: paymentDetails.isBookingFeePaid,
                isRentalFeePaid: paymentDetails.isRentalFeePaid,
                isExtensionPaid: paymentDetails.isExtensionPaid,
                isAdditionalFeePaid: paymentDetails.isAdditionalFeePaid,
                hasExtension: paymentDetails.hasExtension,
                canPickup: paymentDetails.isRentalFeePaid, // Pickup requires rental fee
                canReturn: paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid, // Return requires rental + extension (if exists)
            },
        };
    };

    const fetchBookings = async (forceRefresh = false) => {
        // Implement simple cache - avoid refetching within 30 seconds unless forced
        const now = Date.now();
        const cacheTimeout = 30000; // 30 seconds

        if (!forceRefresh && bookings.length > 0 && (now - lastFetchTime) < cacheTimeout) {
            // console.log(` fetchBookings: using cached data (${Math.round((now - lastFetchTime) / 1000)}s old)`);
            setLoading(false);
            setRefreshing(false);
            return;
        }
        setLoading(true);
        setError(null);
        setLoadingProgress('Loading bookings...');

        try {
            const startTime = Date.now();
            const result = await bookingsService.getAllBookings();

            if (result.error) {
                setError(result.error.message);
                setLoading(false);
                return;
            }

            if (result.data) {
                // console.log(` fetchBookings: received ${result.data.length} bookings - starting batch processing`);

                // Extract unique IDs for batch fetching
                const uniqueCarIds = [...new Set(result.data.map(b => b.carId).filter(Boolean))];
                const uniqueUserIds = [...new Set(result.data.map(b => b.userId).filter(Boolean))];
                const bookingIds = result.data.map(b => b.id);

                // console.log(` fetchBookings: batch sizes - cars: ${uniqueCarIds.length}, users: ${uniqueUserIds.length}, bookings: ${bookingIds.length}`);



                // Batch fetch all data in parallel
                const [
                    carDetailsMap,
                    userDetailsMap,
                    paymentDetailsMap,
                    checkInOutMap,
                    extensionInfoMap
                ] = await Promise.all([
                    batchFetchCarDetails(uniqueCarIds),
                    batchFetchUserDetails(uniqueUserIds),
                    batchFetchPaymentDetails(bookingIds),
                    batchFetchCheckInOutStatus(bookingIds),
                    batchFetchExtensionInfo(bookingIds)
                ]);

                // console.log(` fetchBookings: batch fetching completed - processing bookings`);
                setLoadingProgress('Processing booking data...');

                // Create batch data object
                const batchData = {
                    carDetailsMap,
                    userDetailsMap,
                    paymentDetailsMap,
                    checkInOutMap,
                    extensionInfoMap
                };

                // Map bookings using cached data
                const mappedBookingsPromises = result.data.map(booking => mapSingleBooking(booking, batchData));
                const mappedBookings = await Promise.all(mappedBookingsPromises);

                const endTime = Date.now();
                // console.log(` fetchBookings: completed processing ${mappedBookings.length} bookings in ${endTime - startTime}ms`);

                setBookings(mappedBookings);
                setLastFetchTime(now);
            }
        } catch (error) {
            // console.error(' fetchBookings: error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load bookings');
        }

        setLoading(false);
        setRefreshing(false);
        setLoadingProgress('');
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // console.log('StaffScreen focused - checking if refresh needed...');
            fetchBookings(); // Will use cache if recent
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings(true); // Force refresh on manual pull-to-refresh
    };

    const handleRequestPayment = async (bookingId: string) => {
        try {
            setProcessingPayment(bookingId);

            const result = await paymentService.createRentalPayment(bookingId);

            if (result.error) {
                // Handle duplicate payment error more gracefully
                if (result.error.message.includes('Payment already exists')) {
                    alert('A payment for this booking already exists. Please complete the existing payment or contact support if you need assistance.');
                } else {
                    alert(`Failed to create payment: ${result.error.message}`);
                }
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
            // console.log(' Starting extension payment for booking:', bookingId);

            const result = await bookingExtensionService.getBookingExtensionPaymentUrl(bookingId);

            if (result.error || !result.data) {
                alert(`Failed to create extension payment: ${result.error?.message || 'Unknown error'}`);
                setProcessingExtensionPayment(null);
                return;
            }

            // console.log(' Extension payment URL created:', result.data.checkoutUrl);


            navigation.navigate('PayOSWebView' as any, {
                paymentUrl: result.data.checkoutUrl,
                bookingId: bookingId,
                returnScreen: 'StaffScreen',
            });

            setProcessingExtensionPayment(null);
        } catch (error) {
            // console.error(' Error creating extension payment:', error);
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
        // console.log(' Search Results:', {
        //     query: searchQuery,
        //     totalBookings: bookings.length,
        //     filteredCount: filteredPayments.length,
        //     sampleBookingNumbers: bookings.slice(0, 3).map(b => b.bookingNumber),
        // });
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
        loadingProgress,


        onRefresh,
        handleRequestPayment,
        handlePayExtension,
        fetchBookings,
        navigation,
    };
}