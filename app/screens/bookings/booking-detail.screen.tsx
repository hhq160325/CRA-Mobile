import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { bookingsService } from '../../../lib/api';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';

export default function BookingDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const { id } = (route.params as any) || {};
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await bookingsService.getBookingById(id);
      if (mounted && res.data) setBooking(res.data);
      setLoading(false);
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Booking not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Booking {booking.id}</Text>
        <Text style={{ marginTop: 8 }}>Car: {booking.carName}</Text>
        <Text>Pickup: {booking.pickupLocation}</Text>
        <Text>Dropoff: {booking.dropoffLocation}</Text>
        <Text>Status: {booking.status}</Text>
      </View>
    </View>
  );
}
