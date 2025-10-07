import React from 'react';
import {View, Text} from 'react-native';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function CarsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <Text style={{fontSize: scale(18)}}>Cars</Text>
    </View>
  );
}
