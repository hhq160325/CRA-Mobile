'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import { bookingsService } from '../../../lib/api/services/bookings.service';
import { API_CONFIG } from '../../../lib/api/config';
import { useAuth } from '../../../lib/auth-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './payment-history.styles';

interface PaymentItem {
  orderCode: number;
  item: string;
  paidAmount: number;
  status: string;
  paymentMethod: string;
  createDate: string;
  invoiceId?: string;
  bookingNumber?: string;
  carName?: string;
  userId?: string;
}

interface BookingPayments {
  bookingId: string;
  bookingNumber?: string;
  carName: string;
  payments: PaymentItem[];
}

export default function PaymentHistoryScreen() {
  const { user } = useAuth();
  const [bookingPayments, setBookingPayments] = useState<BookingPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(
    new Set(),
  );

  const getAuthToken = (): string | null => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
        return localStorage.getItem('token');
      }
    } catch (e) {
      console.error('Error getting auth token:', e);
    }
    return null;
  };

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
            p => p.userId === user?.id,
          );

          if (userPayments.length > 0) {
            return {
              bookingId: booking.id,
              bookingNumber: booking.bookingNumber,
              carName: booking.carName,
              payments: userPayments,
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

      setBookingPayments(validResults);
    } catch (err) {
      console.error('Error loading payment history:', err);
      setError('An error occurred while loading payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString('en', {
      month: 'short',
    })} ${d.getFullYear()}`;
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'success' ? '#00B050' : '#d97706';
  };

  const getStatusBgColor = (status: string) => {
    return status.toLowerCase() === 'success' ? '#d1fae5' : '#fef3c7';
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

  const calculateTotal = (payments: PaymentItem[]) => {
    return payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  };

  const renderPaymentItem = (payment: PaymentItem, index: number, totalItems: number) => (
    <View
      key={payment.orderCode}
      style={[
        styles.paymentItem,
        index < totalItems - 1 && styles.paymentItemWithBorder,
      ]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderContent}>
          <Text style={styles.paymentItemName}>{payment.item}</Text>
          <Text style={styles.orderCode}>Order: {payment.orderCode}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(payment.status) },
          ]}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(payment.status) },
            ]}>
            {payment.status}
          </Text>
        </View>
      </View>

      <View style={styles.paymentFooter}>
        <View>
          <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
          <Text style={styles.paymentDate}>{formatDate(payment.createDate)}</Text>
        </View>
        <Text style={styles.paymentAmount}>
          {payment.paidAmount.toLocaleString()} VND
        </Text>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading payment history...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={scale(48)} color="#ef4444" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="receipt-long"
        size={scale(48)}
        color={colors.placeholder}
      />
      <Text style={styles.emptyText}>No payment history found</Text>
    </View>
  );

  const renderBookingPayments = ({ item }: { item: BookingPayments }) => {
    const isExpanded = expandedBookings.has(item.bookingId);
    const totalAmount = calculateTotal(item.payments);

    return (
      <Pressable
        onPress={() => toggleExpanded(item.bookingId)}
        style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingHeaderContent}>
            <Text style={styles.carName}>{item.carName}</Text>
            <Text style={styles.bookingId}>
              Booking ID: {item.bookingNumber || 'N/A'}
            </Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={scale(24)}
            color={colors.primary}
          />
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VND
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            {item.payments.map((payment, index) =>
              renderPaymentItem(payment, index, item.payments.length)
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Payment History</Text>
      </View>

      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={bookingPayments}
          renderItem={renderBookingPayments}
          keyExtractor={item => item.bookingId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState()}
        />
      )}
    </View>
  );
}
