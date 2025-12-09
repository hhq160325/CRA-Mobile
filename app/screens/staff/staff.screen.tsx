'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { bookingsService } from '../../../lib/api/services/bookings.service';
import { paymentService } from '../../../lib/api/services/payment.service';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { styles } from './staff.screen.styles';
import {
  fetchCarDetails,
  fetchCustomerName,
  fetchPaymentDetails,
  fetchCheckInOutStatus,
  mapBookingStatus,
  formatBookingDate,
} from './utils/staffHelpers';
import { ListHeader } from './components/ListHeader';

type PaymentStatus = 'all' | 'successfully' | 'pending' | 'cancelled';

interface BookingItem {
  id: string;
  bookingNumber?: string;
  carId: string;
  carName: string;
  carBrand: string;
  carModel: string;
  carLicensePlate: string;
  carImage: string;
  customerName: string;
  userId: string;
  invoiceId: string;
  amount: number;
  invoiceStatus: string;
  status: string;
  date: string;
  hasCheckIn: boolean;
  hasCheckOut: boolean;
}

export default function StaffScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null,
  );

  const mapSingleBooking = async (booking: any): Promise<BookingItem> => {
    const mappedStatus = mapBookingStatus(booking.status);
    const formattedDate = formatBookingDate(booking.bookingDate);

    const carDetails = booking.carId
      ? await fetchCarDetails(booking.carId)
      : {
        carName: 'Unknown Car',
        carBrand: '',
        carModel: '',
        carLicensePlate: '',
        carImage: '',
      };

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
      console.log('🔄 StaffScreen focused - refreshing bookings...');
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

  const filteredPayments = bookings.filter(payment => {
    const matchesStatus =
      statusFilter === 'all' || payment.status === statusFilter;

    // If no search query, just filter by status
    if (!searchQuery || searchQuery.trim() === '') {
      return matchesStatus;
    }

    // Normalize search query
    const normalizedQuery = searchQuery.toLowerCase().trim();

    // Check all searchable fields
    const matchesSearch =
      payment.carName.toLowerCase().includes(normalizedQuery) ||
      payment.customerName.toLowerCase().includes(normalizedQuery) ||
      payment.id.toLowerCase().includes(normalizedQuery) ||
      (payment.bookingNumber && payment.bookingNumber.toLowerCase().includes(normalizedQuery));

    return matchesStatus && matchesSearch;
  });

  // Debug logging
  if (searchQuery && searchQuery.trim() !== '') {
    console.log('🔍 Search Results:', {
      query: searchQuery,
      totalBookings: bookings.length,
      filteredCount: filteredPayments.length,
      sampleBookingNumbers: bookings.slice(0, 3).map(b => b.bookingNumber),
    });
  }

  const renderPaymentCard = ({ item }: { item: BookingItem }) => {
    const statusBadgeStyle = [
      styles.statusBadge,
      item.status === 'successfully'
        ? styles.statusBadgeSuccess
        : item.status === 'cancelled'
          ? styles.statusBadgeCancelled
          : styles.statusBadgePending,
    ];

    const statusTextStyle = [
      styles.statusText,
      item.status === 'successfully'
        ? styles.statusTextSuccess
        : item.status === 'cancelled'
          ? styles.statusTextCancelled
          : styles.statusTextPending,
    ];

    const confirmPickupTextStyle = [
      styles.confirmPickupText,
      item.hasCheckIn && item.hasCheckOut
        ? styles.confirmPickupTextComplete
        : styles.confirmPickupTextIncomplete,
    ];

    const confirmPickupArrowStyle = [
      styles.confirmPickupArrow,
      item.hasCheckIn && item.hasCheckOut
        ? styles.confirmPickupTextComplete
        : styles.confirmPickupTextIncomplete,
    ];

    return (
      <Pressable style={styles.paymentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.carName}>{item.carName}</Text>
            {item.carLicensePlate && (
              <Text style={styles.licensePlate}>
                License: {item.carLicensePlate}
              </Text>
            )}
            <Text style={styles.bookingId}>
              Booking ID: {item.bookingNumber || 'N/A'}
            </Text>
          </View>
          <View style={statusBadgeStyle}>
            <Text style={statusTextStyle}>
              {item.status === 'successfully'
                ? 'Successful'
                : item.status === 'cancelled'
                  ? 'Cancelled'
                  : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>CUSTOMER</Text>
            <Text style={styles.detailValue}>{item.customerName}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>AMOUNT</Text>
            <Text style={[styles.detailValue, styles.detailValueBold]}>
              {item.amount.toLocaleString()} VND
            </Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {item.status === 'pending' ? (
            <Pressable
              onPress={() => handleRequestPayment(item.id)}
              disabled={processingPayment === item.id}
              style={[
                styles.requestPaymentButton,
                processingPayment === item.id
                  ? styles.requestPaymentButtonDisabled
                  : styles.requestPaymentButtonActive,
              ]}>
              {processingPayment === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.requestPaymentText}>Request Payment</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                navigation.navigate('PickupReturnConfirm' as any, {
                  bookingId: item.id,
                })
              }
              style={styles.confirmPickupButton}>
              <Text style={confirmPickupTextStyle}>
                → Tap to confirm pickup
              </Text>
              <Text style={confirmPickupArrowStyle}>→</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error loading bookings</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filteredPayments}
          renderItem={renderPaymentCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <ListHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
