import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { carsService } from '../../../lib/api';
import type { Car } from '../../../lib/mock-data/cars';
import { getAsset } from '../../../lib/getAsset';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CarListScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await carsService.getCars({});
      if (mounted && res.data) setCars(res.data);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('CarDetail' as any, { id: item.id })}
            style={{
              backgroundColor: colors.white,
              marginBottom: scale(16),
              borderRadius: scale(12),
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <View style={{ padding: scale(16) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(12) }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: scale(16), fontWeight: '700', color: colors.primary, marginBottom: scale(4) }}>{item.name}</Text>
                  <Text style={{ fontSize: scale(12), color: colors.placeholder }}>{item.brand} • {item.category.toUpperCase()}</Text>
                </View>
                <MaterialIcons name="favorite-border" size={scale(20)} color={colors.placeholder} />
              </View>

              <Image
                source={getAsset(item.image) || require('../../../assets/tesla-model-s-luxury.png')}
                style={{ width: '100%', height: scale(120), resizeMode: 'contain', marginBottom: scale(12) }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(16) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="local-gas-station" size={scale(14)} color={colors.placeholder} />
                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginLeft: scale(4) }}>{item.specs.fuel}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="people" size={scale(14)} color={colors.placeholder} />
                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginLeft: scale(4) }}>{item.specs.seats}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: scale(16), fontWeight: '700', color: colors.primary }}>${item.price}</Text>
                  <Text style={{ fontSize: scale(11), color: colors.placeholder }}>/day</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
