import React from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useBookingDetail } from './hooks/useBookingDetail';
import StatusBadge from './components/StatusBadge';
import BookingInfoSection from './components/BookingInfoSection';
import CustomerInfoSection from './components/CustomerInfoSection';
import CarInfoCard from './components/CarInfoCard';
import LocationInfoCard from './components/LocationInfoCard';
import PaymentInfoSection from './components/PaymentInfoSection';
import FeedbackButton from './components/FeedbackButton';

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { id } = (route.params as any) || {};
  const { booking, invoice, payments, loading } = useBookingDetail(id, navigation);

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

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="error-outline" size={64} color={colors.placeholder} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.placeholder }}>
            Booking not found
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
            navigation.navigate('Messages' as any, { bookingId: booking.id });
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
          bookingFee={booking.bookingFee}
        />

        {booking.status?.toLowerCase() === 'completed' && (
          <FeedbackButton
            onPress={() => {
              const params: { carId: string; bookingId?: string } = {
                carId: booking.carId,
                bookingId: booking.id
              };
              navigation.navigate('FeedbackForm', params);
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}
