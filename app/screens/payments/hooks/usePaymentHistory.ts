import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/auth-context';
import { bookingsService } from '../../../../lib/api/services/bookings.service';
import { API_CONFIG } from '../../../../lib/api/config';
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
            const token = getAuthToken();

            const response = await fetch(paymentsUrl, {
                method: 'GET',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const paymentsData = await response.json();

                if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                    const userPayments = paymentsData.filter(
                        (p: PaymentItem) => p.userId === user?.id,
                    );

                    if (userPayments.length > 0) {

                        const sortedPayments = userPayments.sort((a: PaymentItem, b: PaymentItem) =>
                            new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
                        );

                        return {
                            bookingId: booking.id,
                            bookingNumber: booking.bookingNumber,
                            carName: booking.carName,
                            payments: sortedPayments,
                        };
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching booking payments:', err);
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
        toggleExpanded,
        fetchPaymentHistory,
    };
}