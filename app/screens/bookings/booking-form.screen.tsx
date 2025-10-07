import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Alert, ScrollView} from 'react-native';
import {bookingsService} from '../../../lib/api';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function BookingFormScreen({route}: any) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-05');
  const [pickupLocation, setPickupLocation] = useState('San Francisco Airport');
  const [dropoffLocation, setDropoffLocation] = useState('San Francisco Airport');
  const [loading, setLoading] = useState(false);
  const carId = route?.params?.id;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await bookingsService.createBooking({
        carId,
        startDate,
        endDate,
        pickupLocation,
        dropoffLocation,
        driverInfo: {name: 'Guest', email: 'guest@example.com', phone: '000', licenseNumber: 'N/A'},
      } as any);
      if (res.data) {
        navigation.navigate('BookingDetail' as any, {id: res.data.id});
      } else {
        Alert.alert('Error', res.error?.message || 'Failed to create booking');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{padding: 12}}>
      <Text style={{fontWeight: '700', fontSize: 18}}>Book Car</Text>
      <TextInput value={startDate} onChangeText={setStartDate} style={{borderWidth: 1, padding: 8, marginTop: 12}} />
      <TextInput value={endDate} onChangeText={setEndDate} style={{borderWidth: 1, padding: 8, marginTop: 12}} />
      <TextInput value={pickupLocation} onChangeText={setPickupLocation} style={{borderWidth: 1, padding: 8, marginTop: 12}} />
      <TextInput value={dropoffLocation} onChangeText={setDropoffLocation} style={{borderWidth: 1, padding: 8, marginTop: 12}} />
      <Pressable onPress={handleCreate} style={{backgroundColor: colors.button, padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center'}}>
        <Text style={{color: colors.white}}>{loading ? 'Booking...' : 'Confirm Booking'}</Text>
      </Pressable>
    </ScrollView>
  );
}
