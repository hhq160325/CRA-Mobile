import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../../lib/auth-context';
import { bookingsService } from '../../../../lib/api/services/bookings.service';
import { API_CONFIG } from '../../../../lib/api/config';
import { checkAndUpdatePaymentStatuses } from '../../../../lib/api/services/payment-status-checker';
import { getAuthToken } from '../utils/paymentUtils';
import type { PaymentItem, BookingPayments } from '../types/paymentTypes';

export function usePaymentHistory() {
    const { user } = useAuth();
    const [bookingPayments, setBookingPayments] = useState<BookingPayments[]>([]);
    const [filteredBookingPayments, setFilteredBookingPayments] = useState<BookingPayments[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());

    const fetchBookingPayments = async (booking: any): Promise<BookingPayments | null> => {
        if (booking.userId !== user?.id) {
            return null;
        }

        try {
            const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
            const paymentsUrl = `${baseUrl}/Booking/${booking.id}/Payments`;
            const token = await getAuthToken(); // Make this async

            console.log('💰 Fetching payments for booking:', booking.id);
            console.log('🔐 Auth token available:', !!token);

            const response = await fetch(paymentsUrl, {
                method: 'GET',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                },
            });

            console.log('📥 Payment fetch response status:', response.status);

            if (response.ok) {
                const paymentsData = await response.json();
                console.log('📋 Payment data received:', paymentsData);

                if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                    // Don't filter by userId on individual payments since additional fees and extensions
                    // might not have userId set correctly. Instead, we already know this booking belongs to the user.
                    console.log('📋 All payments for user booking:', paymentsData.length);

                    if (paymentsData.length > 0) {
                        // Sort payments by creation date (newest first)
                        const sortedPayments = paymentsData.sort((a: PaymentItem, b: PaymentItem) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
                        );

                        console.log('📋 Payment items found:', sortedPayments.map(p => ({
                            item: p.item,
                            amount: p.paidAmount,
                            status: p.status,
                            hasUserId: !!p.userId
                        })));

                        return {
                            bookingId: booking.id,
                            bookingNumber: booking.bookingNumber,
                            carName: booking.carName,
                            payments: sortedPayments,
                        };
                    }
                } else {
                    console.log('📋 No payment data found for booking:', booking.id);
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Payment fetch failed:', response.status, errorText);
            }
        } catch (err) {
            console.error('💥 Error fetching booking payments:', err);
        }

        return null;
    };

    const fetchPaymentHistory = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const bookingsResult = await bookingsService.getBookings(user.id);

            if (bookingsResult.error || !bookingsResult.data) {
                setError('Failed to load payment history');
                setLoading(false);
                return;
            }

            // Update payment statuses for all bookings before fetching payment data
            console.log('🔄 Updating payment statuses for all bookings...');
            const statusUpdatePromises = bookingsResult.data.map(async (booking) => {
                try {
                    await checkAndUpdatePaymentStatuses(booking.id);
                    console.log(`✅ Updated payment statuses for booking ${booking.bookingNumber}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to update payment statuses for booking ${booking.bookingNumber}:`, error);
                }
            });

            // Wait for all status updates to complete
            await Promise.allSettled(statusUpdatePromises);
            console.log('✅ Payment status updates completed');

            const paymentsPromises = bookingsResult.data.map(fetchBookingPayments);
            const results = await Promise.all(paymentsPromises);
            const validResults = results.filter(r => r !== null) as BookingPayments[];


            const sortedResults = validResults
                .map(booking => ({
                    ...booking,

                    payments: booking.payments.sort((a, b) =>
                        new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
                    ),

                    mostRecentPaymentDate: booking.payments.reduce((latest, payment) => {
                        const paymentDate = new Date(payment.createDate).getTime();
                        return paymentDate > latest ? paymentDate : latest;
                    }, 0)
                }))

                .sort((a, b) => (b.mostRecentPaymentDate || 0) - (a.mostRecentPaymentDate || 0));

            console.log(' Payment History: Sorted results:', {
                totalBookings: sortedResults.length,
                firstBooking: sortedResults[0] ? {
                    carName: sortedResults[0].carName,
                    mostRecentDate: new Date(sortedResults[0].mostRecentPaymentDate || 0).toISOString(),
                    paymentsCount: sortedResults[0].payments.length
                } : null
            });

            setBookingPayments(sortedResults);
            setFilteredBookingPayments(sortedResults);
        } catch (err) {
            console.error('Error loading payment history:', err);
            setError('An error occurred while loading payment history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setFilteredBookingPayments(bookingPayments);
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase().trim();

        const filtered = bookingPayments
            .map(booking => {

                const bookingMatches =
                    booking.carName.toLowerCase().includes(normalizedQuery) ||
                    (booking.bookingNumber && booking.bookingNumber.toLowerCase().includes(normalizedQuery));


                const matchingPayments = booking.payments.filter(payment =>
                    payment.item.toLowerCase().includes(normalizedQuery) ||
                    payment.orderCode.toString().includes(normalizedQuery) ||
                    payment.paymentMethod.toLowerCase().includes(normalizedQuery) ||
                    payment.status.toLowerCase().includes(normalizedQuery)
                );


                if (bookingMatches || matchingPayments.length > 0) {
                    return {
                        ...booking,

                        payments: bookingMatches ? booking.payments : matchingPayments
                    };
                }

                return null;
            })
            .filter(booking => booking !== null) as BookingPayments[];

        console.log('💰 Payment Search: Filtered results:', {
            query: searchQuery,
            originalCount: bookingPayments.length,
            filteredCount: filtered.length
        });

        setFilteredBookingPayments(filtered);
    }, [searchQuery, bookingPayments]);

    useEffect(() => {
        fetchPaymentHistory();
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPaymentHistory();
    };

    const refreshPaymentStatuses = async () => {
        if (!user?.id) return;

        try {
            setRefreshing(true);
            console.log('🔄 Manual payment status refresh triggered...');

            const bookingsResult = await bookingsService.getBookings(user.id);
            if (bookingsResult.data) {
                // Update payment statuses for all user bookings
                let totalUpdated = 0;
                const statusUpdatePromises = bookingsResult.data.map(async (booking) => {
                    try {
                        const result = await checkAndUpdatePaymentStatuses(booking.id);
                        const updatedCount = result.results.filter(r => r.updated).length;
                        totalUpdated += updatedCount;
                        console.log(`✅ Refreshed payment statuses for booking ${booking.bookingNumber}:`, {
                            allPaid: result.allPaid,
                            updatedCount
                        });
                        return result;
                    } catch (error) {
                        console.warn(`⚠️ Failed to refresh payment statuses for booking ${booking.bookingNumber}:`, error);
                        return null;
                    }
                });

                await Promise.allSettled(statusUpdatePromises);

                // Reload payment data after status updates
                await fetchPaymentHistory();

                // Show feedback to user
                if (totalUpdated > 0) {
                    Alert.alert(
                        'Payment Statuses Updated',
                        `${totalUpdated} payment status(es) have been updated successfully.`,
                        [{ text: 'OK' }]
                    );
                } else {
                    Alert.alert(
                        'Payment Statuses Up to Date',
                        'All payment statuses are already current.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('❌ Error refreshing payment statuses:', error);
            Alert.alert(
                'Refresh Failed',
                'Failed to refresh payment statuses. Please try again.',
                [{ text: 'OK' }]
            );
            setError('Failed to refresh payment statuses');
        } finally {
            setRefreshing(false);
        }
    };

    const toggleExpanded = (bookingId: string) => {
        setExpandedBookings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    return {

        bookingPayments,
        filteredBookingPayments,
        searchQuery,
        setSearchQuery,
        loading,
        refreshing,
        error,
        expandedBookings,


        onRefresh,
        refreshPaymentStatuses,
        toggleExpanded,
        fetchPaymentHistory,
    };
}