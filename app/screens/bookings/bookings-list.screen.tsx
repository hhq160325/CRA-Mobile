import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator} from 'react-native';
import {bookingsService} from '../../../lib/api';
import type {Booking} from '../../../lib/mock-data/bookings';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {useAuth} from '../../../lib/auth-context';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function BookingsListScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const {user} = useAuth();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const uid = user?.id ?? '2'
      const res = await bookingsService.getBookings(uid);
      if (mounted && res.data) setBookings(res.data);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={bookings}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{padding: 12}}
      renderItem={({item}) => (
        <Pressable
          onPress={() => navigation.navigate('BookingDetail' as any, {id: item.id})}
          style={{padding: 12, backgroundColor: colors.white, borderRadius: 8, marginBottom: 12}}>
          <Text style={{fontWeight: '700'}}>{item.carName}</Text>
          <Text style={{color: colors.placeholder}}>{item.pickupLocation} → {item.dropoffLocation}</Text>
          <Text style={{marginTop: 6}}>Status: {item.status}</Text>
        </Pressable>
      )}
    />
  );
}
