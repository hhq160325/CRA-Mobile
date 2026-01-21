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
    const [showingRecentOnly, setShowingRecentOnly] = useState(true);
    const [totalBookingsCount, setTotalBookingsCount] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const mapSingleBooking = async (booking: any, batchData: {
        carDetailsMap: Map<string, any>,
        userDetailsMap: Map<string, any>,
        paymentDetailsMap: Map<string, any>,
        checkInOutMap: Map<string, any>,
        extensionInfoMap: Map<string, any>
    }): Promise<BookingItem> => {

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

        if (invoiceAmount === 0 && booking.totalPrice > 0) {
            invoiceAmount = booking.totalPrice;
        }

        if (!paymentDetails.hasPaymentRecord || invoiceStatus === 'no_payment') {
            if (__DEV__) console.log(` mapSingleBooking: No payment record found for ${booking.id} - setting to pending (need to create rental payment)`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        } else if (invoiceStatus === 'booking_paid') {
            // Booking fee paid but no rental fee payment created yet
            if (__DEV__) console.log(` mapSingleBooking: Booking fee paid for ${booking.id} - need to create rental payment`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        } else if (invoiceStatus === 'rental_pending') {
            // Rental fee payment created but not paid yet
            if (__DEV__) console.log(` mapSingleBooking: Rental fee payment pending for ${booking.id} - customer needs to pay`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        } else if (paymentDetails.isRentalFeePaid) {
            // Rental fee is paid - booking is ready for pickup/return
            if (__DEV__) console.log(` mapSingleBooking: Rental fee is paid for ${booking.id} - ready for pickup`);
            invoiceStatus = 'paid';
            mappedStatus = 'successfully';
        } else {
            // Fallback - need payment
            if (__DEV__) console.log(` mapSingleBooking: Fallback status for ${booking.id} - need payment`);
            invoiceStatus = 'pending';
            mappedStatus = 'pending';
        }

        // Additional status checks for return requirements
        // const canPickup = paymentDetails.isRentalFeePaid;
        // const canReturn = paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid;

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

        // Simplified debug logging for booking mapping
        if (__DEV__) {
            console.log(`📋 ${booking.bookingNumber || booking.id.substring(0, 8)}: Mapped - Status=${mappedStatus}, RentalPaid=${paymentDetails.isRentalFeePaid}, CheckIn=${checkInOutStatus.hasCheckIn}, CheckOut=${checkInOutStatus.hasCheckOut}`);
        }

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

            paymentDetails: {
                isBookingFeePaid: paymentDetails.isBookingFeePaid,
                isRentalFeePaid: paymentDetails.isRentalFeePaid,
                isExtensionPaid: paymentDetails.isExtensionPaid,
                isAdditionalFeePaid: paymentDetails.isAdditionalFeePaid,
                hasExtension: paymentDetails.hasExtension,
                canPickup: paymentDetails.isRentalFeePaid,
                canReturn: paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid,
            },
        };
    };

    // Lighter refresh function that only updates payment status without clearing all data
    const refreshPaymentStatus = async () => {
        if (bookings.length === 0) {
            // No existing data, do full refresh
            return fetchBookings(true);
        }

        console.log('🔄 Refreshing payment status for existing bookings...');

        try {
            const bookingIds = bookings.map(b => b.id);
            const paymentDetailsMap = await batchFetchPaymentDetails(bookingIds);

            // Update existing bookings with new payment data
            const updatedBookings = bookings.map(booking => {
                const paymentDetails = paymentDetailsMap.get(booking.id);
                if (!paymentDetails) return booking;

                // Update payment-related fields
                let invoiceStatus = paymentDetails.status;
                let mappedStatus = booking.status;

                if (paymentDetails.isRentalFeePaid) {
                    invoiceStatus = 'paid';
                    mappedStatus = 'successfully';
                } else if (!paymentDetails.hasPaymentRecord || invoiceStatus === 'no_payment') {
                    invoiceStatus = 'pending';
                    mappedStatus = 'pending';
                }

                return {
                    ...booking,
                    invoiceStatus,
                    status: mappedStatus,
                    amount: paymentDetails.amount || booking.amount,
                    paymentDetails: {
                        isBookingFeePaid: paymentDetails.isBookingFeePaid,
                        isRentalFeePaid: paymentDetails.isRentalFeePaid,
                        isExtensionPaid: paymentDetails.isExtensionPaid,
                        isAdditionalFeePaid: paymentDetails.isAdditionalFeePaid,
                        hasExtension: paymentDetails.hasExtension,
                        canPickup: paymentDetails.isRentalFeePaid,
                        canReturn: paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid,
                    },
                };
            });

            setBookings(updatedBookings);
            console.log('✅ Payment status refreshed successfully');
        } catch (error) {
            console.error('🚨 Failed to refresh payment status:', error);
            // Don't show error to user, just log it
        }
    };

    const fetchBookings = async (forceRefresh = false, page = 1) => {

        // CRITICAL FIX: If force refresh, clear cache immediately to ensure no stale data
        if (forceRefresh) {
            try {
                const { apiCache } = require('../../../../lib/api/cache');
                console.log('🧹 fetchBookings: Force refresh detected - clearing cache immediately');
                await apiCache.clearAll();
                console.log('✅ fetchBookings: Cache cleared for force refresh');
            } catch (error) {
                console.error('❌ fetchBookings: Failed to clear cache for force refresh:', error);
            }
        }

        const now = Date.now();
        const cacheTimeout = 600000;

        if (!forceRefresh && bookings.length > 0 && (now - lastFetchTime) < cacheTimeout && page === 1) {
            if (__DEV__) {
                console.log(` Using cached data (${Math.round((now - lastFetchTime) / 1000)}s old)`);
            }
            setLoading(false);
            setRefreshing(false);
            return;
        }


        const shouldShowLoading = bookings.length === 0 || forceRefresh;

        if (shouldShowLoading) {
            setLoading(true);
        }


        if (page === 1 && bookings.length === 0) {
            const skeletonBookings = Array.from({ length: 10 }, (_, index) => ({
                id: `skeleton-${index}`,
                bookingNumber: 'Loading...',
                carId: '',
                carName: 'Loading...',
                carBrand: '',
                carModel: '',
                carLicensePlate: 'Loading...',
                carImage: '',
                customerName: 'Loading...',
                userId: '',
                invoiceId: '',
                amount: 0,
                invoiceStatus: 'pending' as const,
                status: 'pending' as const,
                date: 'Loading...',
                hasCheckIn: false,
                hasCheckOut: false,
                hasExtension: false,
                extensionDescription: undefined,
                extensionDays: undefined,
                extensionAmount: undefined,
                extensionPaymentStatus: undefined,
                isExtensionPaymentCompleted: false,
                paymentDetails: {
                    isBookingFeePaid: false,
                    isRentalFeePaid: false,
                    isExtensionPaid: false,
                    isAdditionalFeePaid: false,
                    hasExtension: false,
                    canPickup: false,
                    canReturn: false,
                },
                isLoading: true,
            }));
            setBookings(skeletonBookings);
        }

        setError(null);
        if (shouldShowLoading) {
            setLoadingProgress(`Loading recent bookings...`);
        }

        try {
            const result = await bookingsService.getAllBookings();

            if (result.error) {
                setError(result.error.message);
                if (shouldShowLoading) {
                    setLoading(false);
                }
                return;
            }

            if (result.data) {

                const sortedBookings = result.data.sort((a, b) =>
                    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
                );


                const recentBookings = sortedBookings.slice(0, 20);
                setTotalBookingsCount(sortedBookings.length);
                setShowingRecentOnly(sortedBookings.length > 20);

                if (__DEV__) {
                    console.log(` PERFORMANCE: Loading only ${recentBookings.length} most recent bookings (out of ${sortedBookings.length} total)`);
                    console.log(` PERFORMANCE: This reduces data processing by ${Math.round((1 - recentBookings.length / sortedBookings.length) * 100)}%`);
                }


                const uniqueCarIds = [...new Set(recentBookings.map(b => b.carId).filter(Boolean))];
                const uniqueUserIds = [...new Set(recentBookings.map(b => b.userId).filter(Boolean))];
                const bookingIds = recentBookings.map(b => b.id);

                if (__DEV__) {
                    console.log(` BATCH SIZES (optimized): cars=${uniqueCarIds.length}, users=${uniqueUserIds.length}, bookings=${bookingIds.length}`);
                }

                const [
                    carDetailsMap,
                    userDetailsMap,
                    paymentDetailsMap,
                    checkInOutMap,
                ] = await Promise.all([
                    batchFetchCarDetails(uniqueCarIds),
                    batchFetchUserDetails(uniqueUserIds),
                    batchFetchPaymentDetails(bookingIds),
                    batchFetchCheckInOutStatus(bookingIds),
                ]);


                const extensionInfoMap = new Map();
                batchFetchExtensionInfo(bookingIds).then(result => {

                    if (result.size > 0) {

                        if (__DEV__) {
                            console.log(` Extension info loaded for ${result.size} bookings`);
                        }
                    }
                }).catch(error => {
                    if (__DEV__) {
                        console.log(' Extension info fetch failed (non-critical):', error.message);
                    }
                });

                if (shouldShowLoading) {
                    setLoadingProgress('Processing booking data...');
                }

                // Create batch data object
                const batchData = {
                    carDetailsMap,
                    userDetailsMap,
                    paymentDetailsMap,
                    checkInOutMap,
                    extensionInfoMap
                };

                // CRITICAL DEBUG: Log batch data summary
                if (__DEV__) {
                    console.log(` fetchBookings: Batch data summary:`);
                    console.log(`fetchBookings: Processing ${recentBookings.length} bookings`);
                    console.log(` fetchBookings: Payment data for ${paymentDetailsMap.size} bookings`);
                    console.log(` fetchBookings: Check-in/out data for ${checkInOutMap.size} bookings`);

                    // Log first few booking IDs to verify they're correct
                    const bookingIds = recentBookings.map(b => b.id);
                    console.log(` fetchBookings: Booking IDs:`, bookingIds.map(id => id.substring(0, 8) + '...'));
                }


                const mappedBookingsPromises = recentBookings.map(booking => mapSingleBooking(booking, batchData));
                const mappedBookings = await Promise.all(mappedBookingsPromises);

                if (__DEV__) {
                    // console.log(` PERFORMANCE: Completed processing ${mappedBookings.length} bookings`);
                }

                if (page === 1) {
                    setBookings(mappedBookings);
                }
                setLastFetchTime(now);
            }
        } catch (error) {
            console.error('🚨 fetchBookings error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load bookings');

            // CRITICAL FIX: Don't clear existing bookings on error during refresh
            // Only clear bookings if this was the initial load (no existing data)
            if (bookings.length === 0) {
                console.log('🚨 Initial load failed - no existing data to preserve');
            } else {
                console.log('🚨 Refresh failed - preserving existing bookings data');
                // Keep existing bookings visible, just show error for user awareness
            }
        }

        if (shouldShowLoading) {
            setLoading(false);
        }
        setRefreshing(false);
        setLoadingProgress('');
    };

    useEffect(() => {
        // AGGRESSIVE FIX: Always clear cache on mount to ensure data integrity
        // This mimics the manual debug button behavior automatically
        const initializeScreen = async () => {
            try {
                const { apiCache } = require('../../../../lib/api/cache');

                console.log('🧹 StaffScreen mounted - starting aggressive cache clearing sequence');

                // CRITICAL FIX: Wait longer to ensure auth-level cache clearing is complete
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('🔄 Initial delay completed, starting cache clearing');

                // Multiple cache clears with longer delays to ensure complete cleanup
                await apiCache.clearAll();
                console.log('✅ First cache clear completed');

                // Longer delay to ensure cache is fully cleared
                await new Promise(resolve => setTimeout(resolve, 1000));

                await apiCache.clearAll();
                console.log('✅ Second cache clear completed');

                // Additional delay before data fetch to ensure cache is completely cleared
                await new Promise(resolve => setTimeout(resolve, 800));

                console.log('🔄 Starting fresh data fetch after complete cache clearing');
                // Use the same pattern as the manual test button
                fetchBookings(true); // Force fresh fetch
                console.log('✅ Fresh data fetch initiated');

            } catch (error) {
                console.log('⚠️ Cache clear failed, proceeding with fetch:', error);
                // Still force fresh fetch even if cache clear fails
                setTimeout(() => {
                    fetchBookings(true);
                }, 1000);
            }
        };

        initializeScreen();
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('🔄 StaffScreen focused - forcing aggressive refresh');

            // AGGRESSIVE FIX: Always clear all cache and force fresh fetch on focus
            const forceRefresh = async () => {
                try {
                    const { apiCache } = require('../../../../lib/api/cache');

                    console.log('🧹 StaffScreen focused - clearing ALL cache aggressively');

                    // Multiple cache clears to ensure complete cleanup - match manual test button
                    await apiCache.clearAll();
                    console.log('✅ First cache clear on focus completed');

                    await new Promise(resolve => setTimeout(resolve, 500));

                    await apiCache.clearAll();
                    console.log('✅ Second cache clear on focus completed');

                    // Force fresh fetch with delay to ensure cache is cleared
                    await new Promise(resolve => setTimeout(resolve, 300));

                    console.log('🔄 Forcing fresh data fetch after focus cache clear');
                    fetchBookings(true);

                } catch (error) {
                    console.error('❌ Failed to clear cache on focus:', error);
                    // Still try to fetch fresh data even if cache clear fails
                    setTimeout(() => {
                        fetchBookings(true);
                    }, 1000);
                }
            };

            forceRefresh();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        setShowingRecentOnly(true);
        setIsInitialLoad(false);
        fetchBookings(true);
    };

    const loadAllBookings = async () => {
        if (loadingMore) return;

        setLoadingMore(true);
        setLoadingProgress('Loading all bookings...');

        try {
            const result = await bookingsService.getAllBookings();

            if (result.error) {
                setError(result.error.message);
                setLoadingMore(false);
                return;
            }

            if (result.data) {
                const sortedBookings = result.data.sort((a, b) =>
                    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
                );


                const uniqueCarIds = [...new Set(sortedBookings.map(b => b.carId).filter(Boolean))];
                const uniqueUserIds = [...new Set(sortedBookings.map(b => b.userId).filter(Boolean))];
                const bookingIds = sortedBookings.map(b => b.id);


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

                const batchData = {
                    carDetailsMap,
                    userDetailsMap,
                    paymentDetailsMap,
                    checkInOutMap,
                    extensionInfoMap
                };

                const mappedBookingsPromises = sortedBookings.map(booking => mapSingleBooking(booking, batchData));
                const mappedBookings = await Promise.all(mappedBookingsPromises);

                setBookings(mappedBookings);
                setShowingRecentOnly(false);
                setLastFetchTime(Date.now());
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load all bookings');
        }

        setLoadingMore(false);
        setLoadingProgress('');
    };

    const handleRequestPayment = async (bookingId: string) => {
        try {
            setProcessingPayment(bookingId);

            const result = await paymentService.createRentalPayment(bookingId);

            if (result.error) {

                if (result.error.message.includes('Payment already exists')) {
                    alert('A payment for this booking already exists. Please complete the existing payment or contact support if you need assistance.');
                } else {
                    alert(`Failed to create payment: ${result.error.message}`);
                }
                setProcessingPayment(null);
                return;
            }

            if (result.data && result.data.checkoutUrl) {
                // Invalidate payment cache before navigating to payment
                const { apiCache } = require('../../../../lib/api/cache');
                apiCache.invalidatePattern('staff:payment:');
                console.log(' Invalidated payment cache before payment navigation');

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
            payment.id.substring(0, 8).toLowerCase().includes(normalizedQuery) || // Short ID search
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
        showingRecentOnly,
        totalBookingsCount,
        loadingMore,


        onRefresh,
        refreshPaymentStatus,
        handleRequestPayment,
        handlePayExtension,
        fetchBookings,
        loadAllBookings,
        navigation,
    };
}