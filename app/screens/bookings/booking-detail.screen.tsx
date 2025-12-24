import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { useBookingDetail } from './hooks/useBookingDetail';
import StatusBadge from './components/StatusBadge';
import BookingInfoSection from './components/BookingInfoSection';
import CustomerInfoSection from './components/CustomerInfoSection';
import CarInfoCard from './components/CarInfoCard';
import LocationInfoCard from './components/LocationInfoCard';
import PaymentInfoSection from './components/PaymentInfoSection';
import FeedbackButton from './components/FeedbackButton';
import ReportCarButton from './components/ReportCarButton';
import { BookingExtensionPayment } from '../../components/BookingExtensionPayment';
import { AdditionalFeePayment } from '../../components/AdditionalFeePayment';

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id?: string; bookingNumber?: string } }, 'params'>>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();
  const { id, bookingNumber } = (route.params as any) || {};

  console.log(' BookingDetailScreen: Rendering with ID:', id);
  console.log(' BookingDetailScreen: Rendering with booking number:', bookingNumber);
  console.log(' BookingDetailScreen: Route params:', route.params);
  console.log(' BookingDetailScreen: User auth state:', { hasUser: !!user, userId: user?.id });


  useEffect(() => {
    if (!user) {
      console.log(' BookingDetailScreen: No authenticated user, navigating to login');
      navigation.navigate('SignInScreen' as any);
    }
  }, [user, navigation]);

  // Don't call useBookingDetail if we don't have proper parameters
  const bookingIdentifier = id || bookingNumber;
  const shouldLoadBooking = !!bookingIdentifier && !!user;

  const { booking, invoice, payments, bookingFee, loading } = useBookingDetail(
    shouldLoadBooking ? bookingIdentifier : '',
    navigation
  );

  console.log(' BookingDetailScreen: Hook results:', {
    hasBooking: !!booking,
    loading,
    bookingId: booking?.id,
    carName: booking?.carName
  });


  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={{ marginTop: 16, color: colors.placeholder }}>Checking authentication...</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
          <Text style={{ marginTop: 16, color: colors.placeholder }}>Loading booking...</Text>
        </View>
      </View>
    );
  }

  if (!id && !bookingNumber) {
    console.error('BookingDetail: No booking ID or booking number provided');
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error-outline" size={64} color={colors.placeholder} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.placeholder }}>
            No booking identifier provided
          </Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error-outline" size={64} color={colors.placeholder} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.placeholder }}>
            Booking not found
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: colors.placeholder }}>
            {id ? `ID: ${id}` : `Number: ${bookingNumber}`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <StatusBadge
          status={booking.status}
          bookingId={booking.id}
          onMessagesPress={() => {
            navigation.navigate('Messages' as any, {
              bookingId: booking.id,
              bookingNumber: booking.bookingNumber,
              licensePlate: booking.carDetails?.licensePlate || 'N/A'
            });
          }}
        />

        <BookingInfoSection
          bookingNumber={booking.bookingNumber}
        />

        {booking.driverInfo && (
          <CustomerInfoSection driverInfo={booking.driverInfo} />
        )}

        {booking.carImage && (
          <CarInfoCard carImage={booking.carImage} carName={booking.carName} />
        )}

        <LocationInfoCard
          title="Pick-up"
          iconName="location-on"
          location={booking.pickupLocation}
          date={booking.startDate}
        />

        <LocationInfoCard
          title="Drop-off"
          iconName="flag"
          location={booking.dropoffLocation}
          date={booking.endDate}
        />

        <PaymentInfoSection
          invoice={invoice}
          totalPrice={booking.totalPrice}
          bookingDate={booking.bookingDate}
          payments={payments}
          bookingFee={bookingFee}
        />

        {/* Booking Extension Payment Component */}
        <BookingExtensionPayment
          bookingId={booking.id}
          onPaymentComplete={() => {
            // Refresh the booking detail data after payment completion
            console.log(' Booking extension payment completed, refreshing data...');
            // The useBookingDetail hook should automatically refresh
          }}
        />

        {/* Additional Fee Payment Component */}
        <AdditionalFeePayment
          bookingId={booking.id}
          onPaymentComplete={() => {
            // Refresh the booking detail data after payment completion
            console.log(' Additional fee payment completed, refreshing data...');
            // The useBookingDetail hook should automatically refresh
          }}
        />

        {/* Report Car Button - Available for all booking statuses */}
        <ReportCarButton
          onPress={() => {
            console.log(' BookingDetail: Navigating to ReportCar with params:', {
              carId: booking.carId,
              carName: booking.carName,
              bookingId: booking.id,
              bookingNumber: booking.bookingNumber,
              licensePlate: booking.carDetails?.licensePlate,
            });
            try {
              navigation.navigate('ReportCar', {
                carId: booking.carId,
                carName: booking.carName,
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber,
                licensePlate: booking.carDetails?.licensePlate || 'N/A',
              });
              console.log(' BookingDetail: Navigation call completed');
            } catch (error) {
              console.error(' BookingDetail: Navigation error:', error);
            }
          }}
        />

        {booking.status?.toLowerCase() === 'completed' && (
          <FeedbackButton
            onPress={() => {
              const params: { carId: string; bookingId?: string; bookingNumber?: string } = {
                carId: booking.carId,
                bookingId: booking.id,
                bookingNumber: booking.bookingNumber
              };
              navigation.navigate('FeedbackForm', params);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}
