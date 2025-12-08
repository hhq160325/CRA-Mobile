import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../../navigators/navigation-route';

interface LocationSectionProps {
  type: 'pickup' | 'dropoff';
  location: string;
  onLocationChange: (value: string) => void;
}

function LocationSection({
  type,
  location,
  onLocationChange,
}: LocationSectionProps) {
  const isPickup = type === 'pickup';

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: scale(16),
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: scale(12),
        }}>
        <View
          style={{
            width: scale(12),
            height: scale(12),
            borderRadius: scale(6),
            backgroundColor: colors.morentBlue,
            opacity: isPickup ? 0.3 : 1,
            marginRight: scale(8),
          }}
        />
        <Text
          style={{
            fontSize: scale(14),
            fontWeight: '600',
            color: colors.primary,
          }}>
          {isPickup ? 'Pick - Up' : 'Drop - Off'}
        </Text>
      </View>

      {/* Location Input */}
      <View>
        <Text
          style={{
            fontSize: scale(12),
            fontWeight: '700',
            color: colors.primary,
            marginBottom: scale(4),
          }}>
          Location
        </Text>
        <TextInput
          placeholder="City name"
          placeholderTextColor={colors.placeholder}
          value={location}
          onChangeText={onLocationChange}
          style={{
            fontSize: scale(11),
            color: colors.primary,
            padding: 0,
            margin: 0,
          }}
        />
      </View>
    </View>
  );
}

export default function PickupDropoffSection() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');

  const handleSwap = () => {
    const tempLocation = pickupLocation;
    setPickupLocation(dropoffLocation);
    setDropoffLocation(tempLocation);
  };

  const handleGo = () => {
    if (!pickupLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter pickup location');
      return;
    }
    if (!dropoffLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter dropoff location');
      return;
    }

    navigation.navigate('CarMapRouteScreen' as any, {
      pickupLocation,
      dropoffLocation,
      showRoute: true,
    });
  };

  const isFormValid = pickupLocation.trim() && dropoffLocation.trim();

  return (
    <>
      {/* Pick-Up Section */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(16) }}>
        <LocationSection
          type="pickup"
          location={pickupLocation}
          onLocationChange={setPickupLocation}
        />
      </View>

      {/* Swap Button */}
      <View style={{ alignItems: 'center', marginBottom: scale(16) }}>
        <Pressable
          onPress={handleSwap}
          style={{
            backgroundColor: colors.morentBlue,
            width: scale(50),
            height: scale(50),
            borderRadius: scale(8),
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.morentBlue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}>
          <MaterialIcons
            name="swap-vert"
            size={scale(24)}
            color={colors.white}
          />
        </Pressable>
      </View>

      {/* Drop-Off Section */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(16) }}>
        <LocationSection
          type="dropoff"
          location={dropoffLocation}
          onLocationChange={setDropoffLocation}
        />
      </View>

      {/* GO Button */}
      <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
        <Pressable
          onPress={handleGo}
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid
              ? colors.morentBlue
              : colors.placeholder,
            paddingVertical: scale(16),
            borderRadius: scale(12),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: isFormValid ? colors.morentBlue : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isFormValid ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: isFormValid ? 6 : 2,
          }}>
          <MaterialIcons
            name="directions"
            size={scale(24)}
            color={colors.white}
            style={{ marginRight: scale(8) }}
          />
          <Text
            style={{
              fontSize: scale(16),
              fontWeight: '700',
              color: colors.white,
              letterSpacing: 0.5,
            }}>
            GO
          </Text>
        </Pressable>
      </View>
    </>
  );
}
