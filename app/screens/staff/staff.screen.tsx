'use client';

import {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {colors} from '../../theme/colors';
import {scale, verticalScale} from '../../theme/scale';
import Header from '../../components/Header/Header';
import {bookingsService} from '../../../lib/api/services/bookings.service';
import {carsService} from '../../../lib/api/services/cars.service';
import {userService} from '../../../lib/api/services/user.service';
import {invoiceService} from '../../../lib/api/services/invoice.service';
import {paymentService} from '../../../lib/api/services/payment.service';
import {scheduleService} from '../../../lib/api/services/schedule.service';
import {API_CONFIG} from '../../../lib/api/config';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';

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
      const mappedBookingsPromises = result.data.map(async booking => {
        let mappedStatus = 'pending';
        const statusLower = booking.status.toLowerCase();

        if (statusLower === 'completed' || statusLower === 'confirmed') {
          mappedStatus = 'successfully';
        } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
          mappedStatus = 'cancelled';
        }

        const bookingDate = new Date(booking.bookingDate);
        const formattedDate = `${bookingDate.getDate()} ${bookingDate.toLocaleString(
          'en',
          {month: 'short'},
        )}`;

        let carName = 'Unknown Car';
        let carBrand = '';
        let carModel = '';
        let carLicensePlate = '';
        let carImage = '';

        if (booking.carId) {
          try {
            const carResult = await carsService.getCarById(booking.carId);
            if (carResult.data) {
              carName = carResult.data.name || 'Unknown Car';
              carBrand = carResult.data.brand || '';
              carModel = carResult.data.model || '';
              carLicensePlate = carResult.data.licensePlate || '';
              carImage = carResult.data.image || '';
            }
          } catch (err) {}
        }

        let customerName = 'Customer';
        if (booking.userId) {
          try {
            const userResult = await userService.getUserById(booking.userId);
            if (userResult.data) {
              customerName =
                userResult.data.fullname ||
                userResult.data.username ||
                'Customer';
            }
          } catch (err) {}
        }

        let invoiceAmount = 0;
        let invoiceStatus = 'pending';

        try {
          const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
          const paymentsUrl = `${baseUrl}/Booking/${booking.id}/Payments`;

          let token: string | null = null;
          try {
            if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
              token = localStorage.getItem('token');
            }
          } catch (e) {}

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
              const rentalFeePayment = paymentsData.find(
                p => p.item === 'Rental Fee',
              );

              if (rentalFeePayment) {
                invoiceAmount = Number(rentalFeePayment.paidAmount) || 0;
                invoiceStatus =
                  rentalFeePayment.status?.toLowerCase() || 'pending';
              }
            }
          }
        } catch (err) {}

        if (invoiceAmount === 0 && booking.totalPrice > 0) {
          invoiceAmount = booking.totalPrice;
        }

        if (mappedStatus === 'successfully' && invoiceStatus === 'pending') {
          invoiceStatus = 'paid';
        }

        let hasCheckIn = false;
        let hasCheckOut = false;

        try {
          const checkInResult = await scheduleService.getCheckInImages(
            booking.id,
          );
          if (checkInResult.data && checkInResult.data.images.length > 0) {
            hasCheckIn = true;
          }
        } catch (err) {}

        try {
          const checkOutResult = await scheduleService.getCheckOutImages(
            booking.id,
          );
          if (checkOutResult.data && checkOutResult.data.images.length > 0) {
            hasCheckOut = true;
          }
        } catch (err) {}

        return {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          carId: booking.carId,
          carName: carName,
          carBrand: carBrand,
          carModel: carModel,
          carLicensePlate: carLicensePlate,
          carImage: carImage,
          customerName: customerName,
          userId: booking.userId,
          invoiceId: booking.invoiceId,
          amount: invoiceAmount,
          invoiceStatus: invoiceStatus,
          status: mappedStatus,
          date: formattedDate,
          hasCheckIn: hasCheckIn,
          hasCheckOut: hasCheckOut,
        };
      });

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
    const matchesSearch =
      payment.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const renderPaymentCard = ({item}: {item: BookingItem}) => {
    return (
      <Pressable
        style={{
          backgroundColor: 'white',
          borderRadius: scale(12),
          padding: scale(16),
          marginBottom: verticalScale(12),
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: verticalScale(12),
          }}>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: scale(18),
                fontWeight: 'bold',
                color: colors.primary,
                marginBottom: verticalScale(4),
              }}>
              {item.carName}
            </Text>
            {item.carLicensePlate && (
              <Text
                style={{
                  fontSize: scale(12),
                  color: '#6b7280',
                  marginBottom: verticalScale(4),
                }}>
                License: {item.carLicensePlate}
              </Text>
            )}
            <Text style={{fontSize: scale(12), color: '#6b7280'}}>
              Booking ID: {item.bookingNumber || 'N/A'}
            </Text>
          </View>
          <View
            style={{
              backgroundColor:
                item.status === 'successfully'
                  ? '#d1fae5'
                  : item.status === 'cancelled'
                  ? '#fee2e2'
                  : '#fef3c7',
              paddingHorizontal: scale(12),
              paddingVertical: verticalScale(6),
              borderRadius: scale(16),
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: scale(12),
                fontWeight: '600',
                color:
                  item.status === 'successfully'
                    ? '#059669'
                    : item.status === 'cancelled'
                    ? '#991b1b'
                    : '#d97706',
              }}>
              {item.status === 'successfully'
                ? 'Successful'
                : item.status === 'cancelled'
                ? 'Cancelled'
                : 'Pending'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: verticalScale(12),
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            marginBottom: verticalScale(12),
          }}>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: scale(10),
                color: '#6b7280',
                fontWeight: '600',
                marginBottom: verticalScale(4),
              }}>
              CUSTOMER
            </Text>
            <Text
              style={{
                fontSize: scale(13),
                fontWeight: '600',
                color: colors.primary,
              }}>
              {item.customerName}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: scale(10),
                color: '#6b7280',
                fontWeight: '600',
                marginBottom: verticalScale(4),
              }}>
              AMOUNT
            </Text>
            <Text
              style={{
                fontSize: scale(13),
                fontWeight: 'bold',
                color: colors.primary,
              }}>
              {item.amount.toLocaleString()} VND
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: scale(10),
                color: '#6b7280',
                fontWeight: '600',
                marginBottom: verticalScale(4),
              }}>
              DATE
            </Text>
            <Text
              style={{
                fontSize: scale(13),
                fontWeight: '600',
                color: colors.primary,
              }}>
              {item.date}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {item.status === 'pending' ? (
            <Pressable
              onPress={() => handleRequestPayment(item.id)}
              disabled={processingPayment === item.id}
              style={{
                backgroundColor:
                  processingPayment === item.id ? '#9ca3af' : colors.morentBlue,
                paddingHorizontal: scale(16),
                paddingVertical: scale(8),
                borderRadius: scale(8),
                opacity: processingPayment === item.id ? 0.6 : 1,
              }}>
              {processingPayment === item.id ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={{
                    fontSize: scale(12),
                    fontWeight: '600',
                    color: colors.white,
                  }}>
                  Request Payment
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                navigation.navigate('PickupReturnConfirm' as any, {
                  bookingId: item.id,
                })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <Text
                style={{
                  fontSize: scale(13),
                  fontWeight: '600',
                  color:
                    item.hasCheckIn && item.hasCheckOut
                      ? '#00B050'
                      : colors.primary,
                }}>
                → Tap to confirm pickup
              </Text>
              <Text
                style={{
                  fontSize: scale(20),
                  color:
                    item.hasCheckIn && item.hasCheckOut
                      ? '#00B050'
                      : colors.primary,
                }}>
                →
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f9fafb'}}>
      <Header />

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              marginTop: verticalScale(16),
              fontSize: scale(14),
              color: '#6b7280',
            }}>
            Loading bookings...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: scale(32),
          }}>
          <Text
            style={{
              fontSize: scale(16),
              color: '#ef4444',
              textAlign: 'center',
              marginBottom: verticalScale(16),
            }}>
            Error loading bookings
          </Text>
          <Text
            style={{
              fontSize: scale(14),
              color: '#6b7280',
              textAlign: 'center',
            }}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          style={{flex: 1}}
          data={filteredPayments}
          renderItem={renderPaymentCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: scale(16),
            paddingBottom: verticalScale(100),
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: scale(8),
                  paddingHorizontal: scale(12),
                  marginBottom: verticalScale(16),
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}>
                <TextInput
                  placeholder="Search by car name, customer, or payment ID..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{height: verticalScale(44), fontSize: scale(14)}}
                />
              </View>

              {/* Status Filter Tabs */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'white',
                  padding: scale(12),
                  borderRadius: scale(8),
                  marginBottom: verticalScale(16),
                  gap: scale(8),
                }}>
                {(
                  [
                    'all',
                    'successfully',
                    'pending',
                    'cancelled',
                  ] as PaymentStatus[]
                ).map(status => (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={{
                      flex: 1,
                      paddingVertical: verticalScale(8),
                      paddingHorizontal: scale(12),
                      borderRadius: scale(20),
                      backgroundColor:
                        statusFilter === status ? colors.primary : '#f3f4f6',
                    }}>
                    <Text
                      style={{
                        fontSize: scale(12),
                        fontWeight: '600',
                        color: statusFilter === status ? 'white' : '#6b7280',
                        textAlign: 'center',
                      }}>
                      {status === 'all'
                        ? 'All'
                        : status === 'successfully'
                        ? 'Success'
                        : status === 'pending'
                        ? 'Pending'
                        : 'Cancelled'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={{padding: scale(32), alignItems: 'center'}}>
              <Text style={{fontSize: scale(16), color: '#6b7280'}}>
                No payments found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
