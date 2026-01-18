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

        if (__DEV__) {
            // console.log(` mapSingleBooking: Processing booking ${booking.id} (${booking.bookingNumber})`);
            // console.log(` mapSingleBooking: Payment details:`, paymentDetails);
            // console.log(` mapSingleBooking: Original booking status: ${booking.status}, mapped: ${mappedStatus}`);
        }

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
        const canPickup = paymentDetails.isRentalFeePaid;
        const canReturn = paymentDetails.isRentalFeePaid && paymentDetails.isExtensionPaid;
        if (__DEV__) {
            // console.log(` mapSingleBooking: Action requirements for ${booking.id}: canPickup=${canPickup}, canReturn=${canReturn} (rental paid=${paymentDetails.isRentalFeePaid}, extension paid=${paymentDetails.isExtensionPaid})`);
            // console.log(` mapSingleBooking: Final status for ${booking.id}: ${mappedStatus}, invoice status: ${invoiceStatus}`);
        }

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

    const fetchBookings = async (forceRefresh = false, page = 1, pageSize = 20) => {
       
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
            const startTime = Date.now();
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

               
                const mappedBookingsPromises = recentBookings.map(booking => mapSingleBooking(booking, batchData));
                const mappedBookings = await Promise.all(mappedBookingsPromises);

                const endTime = Date.now();
                if (__DEV__) {
                    // console.log(` PERFORMANCE: Completed processing ${mappedBookings.length} bookings in ${endTime - startTime}ms`);
                    // console.log(` PERFORMANCE: Estimated time saved: ${Math.round((sortedBookings.length / 20 - 1) * (endTime - startTime))}ms`);
                }

                if (page === 1) {
                    setBookings(mappedBookings);
                }
                setLastFetchTime(now);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load bookings');
        }

        if (shouldShowLoading) {
            setLoading(false);
        }
        setRefreshing(false);
        setLoadingProgress('');
    };

    useEffect(() => {
        fetchBookings();
        setIsInitialLoad(false);
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (__DEV__) {
                // console.log('StaffScreen focused - checking refresh need:', {
                //     hasBookings: bookings.length > 0,
                //     cacheAge: lastFetchTime ? Math.round((Date.now() - lastFetchTime) / 1000) : 'no-cache',
                //     isInitialLoad,
                //     shouldRefresh: shouldRefreshOnFocus()
                // });
            }

            if (shouldRefreshOnFocus()) {
                fetchBookings();
            }
        });

        return unsubscribe;
    }, [navigation, bookings.length, lastFetchTime, isInitialLoad]);

 
    const shouldRefreshOnFocus = () => {
        if (isInitialLoad || bookings.length === 0) {
            return true;
        }

        const now = Date.now();
        const cacheTimeout = 600000; 
        const isStale = (now - lastFetchTime) > cacheTimeout;

       
        return isStale;
    };

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

                // Batch fetch all data
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
        handleRequestPayment,
        handlePayExtension,
        fetchBookings,
        loadAllBookings,
        navigation,
    };
}