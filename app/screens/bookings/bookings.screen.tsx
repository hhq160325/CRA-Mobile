import React from 'react';
import {View, Text} from 'react-native';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function BookingsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <Text style={{fontSize: scale(18)}}>Bookings</Text>
    </View>
  );
}
