import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';

type BookingStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  carName: string;
  carImage: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const mockBookings: Booking[] = [
  {
    id: '1',
    carName: 'Tesla Model S',
    carImage: 'tesla-model-s-luxury.png',
    pickupLocation: 'New York',
    dropoffLocation: 'Boston',
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    totalPrice: 450,
    status: 'upcoming',
  },
  {
    id: '2',
    carName: 'BMW X5',
    carImage: 'bmw-x5-suv.png',
    pickupLocation: 'Los Angeles',
    dropoffLocation: 'San Francisco',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    totalPrice: 320,
    status: 'completed',
  },
  {
    id: '3',
    carName: 'Mercedes-Benz C-Class',
    carImage: 'mercedes-c-class-sedan.png',
    pickupLocation: 'Miami',
    dropoffLocation: 'Orlando',
    startDate: '2024-01-08',
    endDate: '2024-01-09',
    totalPrice: 180,
    status: 'cancelled',
  },
  {
    id: '4',
    carName: 'Audi A4',
    carImage: 'audi-a4-sedan.png',
    pickupLocation: 'Chicago',
    dropoffLocation: 'Detroit',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    totalPrice: 280,
    status: 'upcoming',
  },
];

export default function BookingsScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');

  const filteredBookings = statusFilter === 'all'
    ? mockBookings
    : mockBookings.filter(b => b.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return colors.morentBlue;
      case 'completed':
        return '#00B050';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return colors.placeholder;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}
        contentContainerStyle={{
          paddingHorizontal: scale(16),
          paddingVertical: verticalScale(12)
        }}
      >
        {(['all', 'upcoming', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
          <Pressable
            key={status}
            onPress={() => setStatusFilter(status)}
            style={{
              paddingHorizontal: scale(16),
              paddingVertical: verticalScale(8),
              marginRight: scale(8),
              borderRadius: scale(20),
              backgroundColor: statusFilter === status ? colors.morentBlue : colors.background,
            }}
          >
            <Text
              style={{
                fontSize: scale(13),
                fontWeight: '600',
                color: statusFilter === status ? colors.white : colors.placeholder,
                textTransform: 'capitalize',
              }}
            >
              {status === 'all' ? 'All Bookings' : status}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: scale(16) }}
      >
        {filteredBookings.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: verticalScale(40) }}>
            <Text style={{ fontSize: scale(16), color: colors.placeholder }}>
              No bookings found
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => navigation.navigate('BookingDetail' as any, { id: booking.id })}
              style={{
                backgroundColor: colors.white,
                borderRadius: scale(12),
                marginBottom: verticalScale(16),
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Status Badge */}
              <View
                style={{
                  position: 'absolute',
                  top: scale(12),
                  right: scale(12),
                  backgroundColor: getStatusColor(booking.status),
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(6),
                  borderRadius: scale(16),
                  zIndex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: scale(11),
                    fontWeight: '600',
                    color: colors.white,
                    textTransform: 'capitalize',
                  }}
                >
                  {booking.status}
                </Text>
              </View>

              {/* Booking Details */}
              <View style={{ padding: scale(16) }}>
                {/* Car name */}
                <Text
                  style={{
                    fontSize: scale(16),
                    fontWeight: '700',
                    color: colors.primary,
                    marginBottom: verticalScale(4),
                  }}
                >
                  {booking.carName}
                </Text>

                {/* Locations */}
                <Text
                  style={{
                    fontSize: scale(12),
                    color: colors.placeholder,
                    marginBottom: verticalScale(12),
                  }}
                >
                  {booking.pickupLocation} → {booking.dropoffLocation}
                </Text>

                {/* Dates and price row */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: scale(11),
                        color: colors.placeholder,
                        marginBottom: verticalScale(4),
                      }}
                    >
                      Booking Date
                    </Text>
                    <Text
                      style={{
                        fontSize: scale(13),
                        fontWeight: '600',
                        color: colors.primary,
                      }}
                    >
                      {booking.startDate} - {booking.endDate}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: scale(11),
                        color: colors.placeholder,
                        marginBottom: verticalScale(4),
                      }}
                    >
                      Total Price
                    </Text>
                    <Text
                      style={{
                        fontSize: scale(16),
                        fontWeight: '700',
                        color: colors.morentBlue,
                      }}
                    >
                      ${booking.totalPrice}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
