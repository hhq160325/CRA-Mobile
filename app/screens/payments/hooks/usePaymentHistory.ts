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
            const token = await getAuthToken();

            const response = await fetch(paymentsUrl, {
                method: 'GET',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                },
            });

            if (response.ok) {
                const paymentsData = await response.json();

                if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                    const sortedPayments = paymentsData.sort((a: PaymentItem, b: PaymentItem) =>
                        new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
                    );

                    return {
                        bookingId: booking.id,
                        bookingNumber: booking.bookingNumber,
                        carName: booking.carName,
                        payments: sortedPayments,
                    };
                }
            } else {
                const errorText = await response.text();
                console.error('Payment fetch failed:', response.status, errorText);
            }
        } catch (err) {
            console.error('Error fetching booking payments:', err);
        }

        return null;
    };

    const fetchPaymentHistory = async (isRefresh = false) => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        if (!isRefresh) {
            setLoading(true);
        }
        setError(null);

        try {
            // Step 1: Get bookings first (fast)
            console.log('PaymentHistory: Loading bookings...');
            const bookingsResult = await bookingsService.getBookings(user.id);

            if (bookingsResult.error || !bookingsResult.data) {
                setError('Failed to load payment history');
                setLoading(false);
                return;
            }

            console.log(`PaymentHistory: Found ${bookingsResult.data.length} bookings`);

            // Step 2: Load payment data in parallel (much faster)
            console.log('PaymentHistory: Loading payments in parallel...');
            const paymentsPromises = bookingsResult.data.map(booking =>
                fetchBookingPayments(booking).catch(err => {
                    console.warn(`Failed to load payments for booking ${booking.id}:`, err);
                    return null;
                })
            );

            // Execute all payment fetches in parallel
            const results = await Promise.all(paymentsPromises);
            const validResults = results.filter(r => r !== null) as BookingPayments[];

            // Step 3: Sort and display data immediately
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

            console.log(`PaymentHistory: Loaded ${sortedResults.length} bookings with payments`);

            // ✅ Show data immediately
            setBookingPayments(sortedResults);
            setFilteredBookingPayments(sortedResults);
            setLoading(false);

            // Step 4: Update payment statuses in background (non-blocking)
            if (sortedResults.length > 0) {
                updatePaymentStatusesInBackground(bookingsResult.data, isRefresh);
            }

        } catch (err) {
            console.error('Error loading payment history:', err);
            setError('An error occurred while loading payment history');
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    // Background function for payment status updates
    const updatePaymentStatusesInBackground = async (bookings: any[], showAlert = false) => {
        console.log('PaymentHistory: Updating payment statuses in background...');

        try {
            let totalUpdated = 0;

            // Update statuses in batches to avoid overwhelming the server
            const batchSize = 5;
            for (let i = 0; i < bookings.length; i += batchSize) {
                const batch = bookings.slice(i, i + batchSize);

                const batchPromises = batch.map(async (booking) => {
                    try {
                        const result = await checkAndUpdatePaymentStatuses(booking.id);
                        const updatedCount = result.results.filter(r => r.updated).length;
                        totalUpdated += updatedCount;
                        return updatedCount > 0;
                    } catch (error) {
                        console.warn(`Failed to update payment statuses for booking ${booking.bookingNumber}:`, error);
                        return false;
                    }
                });

                await Promise.allSettled(batchPromises);

                // Small delay between batches to prevent server overload
                if (i + batchSize < bookings.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // If any statuses were updated, refresh the payment data
            if (totalUpdated > 0) {
                console.log(`PaymentHistory: ${totalUpdated} payment statuses updated, refreshing data...`);

                // Reload payment data silently
                const paymentsPromises = bookings.map(booking =>
                    fetchBookingPayments(booking).catch(() => null)
                );
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

                setBookingPayments(sortedResults);
                setFilteredBookingPayments(prev => {
                    // Preserve search results if user is searching
                    if (searchQuery.trim()) {
                        return filterBookingsByQuery(sortedResults, searchQuery);
                    }
                    return sortedResults;
                });

                if (showAlert) {
                    Alert.alert(
                        'Payment Statuses Updated',
                        `${totalUpdated} payment status(es) have been updated successfully.`,
                        [{ text: 'OK' }]
                    );
                }
            } else if (showAlert) {
                Alert.alert(
                    'Payment Statuses Up to Date',
                    'All payment statuses are already current.',
                    [{ text: 'OK' }]
                );
            }

        } catch (error) {
            console.error('Error updating payment statuses in background:', error);
            if (showAlert) {
                Alert.alert(
                    'Update Failed',
                    'Failed to update payment statuses. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        }
    };

    // Helper function for filtering
    const filterBookingsByQuery = (bookings: BookingPayments[], query: string) => {
        const normalizedQuery = query.toLowerCase().trim();

        return bookings
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
    };

    // Search effect
    useEffect(() => {
        if (!searchQuery || searchQuery.trim() === '') {
            setFilteredBookingPayments(bookingPayments);
            return;
        }

        const filtered = filterBookingsByQuery(bookingPayments, searchQuery);
        setFilteredBookingPayments(filtered);
    }, [searchQuery, bookingPayments]);

    useEffect(() => {
        fetchPaymentHistory();
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPaymentHistory(true);
    };

    const refreshPaymentStatuses = async () => {
        if (!user?.id) return;

        try {
            setRefreshing(true);
            console.log('Manual payment status refresh triggered...');

            const bookingsResult = await bookingsService.getBookings(user.id);
            if (bookingsResult.data) {
                await updatePaymentStatusesInBackground(bookingsResult.data, true);
            }
        } catch (error) {
            console.error('Error refreshing payment statuses:', error);
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