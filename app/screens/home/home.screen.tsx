import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NavigatorParamList} from '../../navigators/navigation-route';
import type {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}>
      <Text style={{fontSize: scale(18), marginBottom: scale(16)}}>Home</Text>
      <Pressable
        onPress={() => navigation.navigate('OnBoardingScreen' as any)}
        style={{
          backgroundColor: colors.button,
          paddingHorizontal: scale(16),
          paddingVertical: scale(10),
          borderRadius: 8,
        }}>
        <Text style={{color: colors.white}}>Open Onboarding</Text>
      </Pressable>
    </View>
  );
}
