import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { carsService, type Car } from '../../../lib/api';
import { getAsset } from '../../../lib/getAsset';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import Header from '../../components/Header/Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFavorites } from '../../../lib/favorites-context';

export default function CarListScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

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

  const displayedCars = activeTab === 'favorites'
    ? cars.filter(car => favorites.includes(car.id))
    : cars;

  const handleFavoritePress = (carId: string, e: any) => {
    e.stopPropagation();
    toggleFavorite(carId);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      {/* Tabs */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingTop: scale(16),
        paddingBottom: scale(8),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <Pressable
          onPress={() => setActiveTab('all')}
          style={{
            flex: 1,
            paddingVertical: scale(12),
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'all' ? colors.morentBlue : 'transparent',
            alignItems: 'center'
          }}
        >
          <Text style={{
            fontSize: scale(14),
            fontWeight: '600',
            color: activeTab === 'all' ? colors.morentBlue : colors.placeholder
          }}>
            All Cars ({cars.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('favorites')}
          style={{
            flex: 1,
            paddingVertical: scale(12),
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'favorites' ? colors.morentBlue : 'transparent',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Ionicons
            name="heart"
            size={scale(16)}
            color={activeTab === 'favorites' ? colors.morentBlue : colors.placeholder}
            style={{ marginRight: scale(4) }}
          />
          <Text style={{
            fontSize: scale(14),
            fontWeight: '600',
            color: activeTab === 'favorites' ? colors.morentBlue : colors.placeholder
          }}>
            Favorites ({favorites.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={displayedCars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: scale(16) }}
        ListEmptyComponent={
          activeTab === 'favorites' ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: scale(60)
            }}>
              <Ionicons name="heart-outline" size={scale(64)} color={colors.border} />
              <Text style={{
                fontSize: scale(16),
                color: colors.placeholder,
                marginTop: scale(16),
                textAlign: 'center'
              }}>
                No favorite cars yet
              </Text>
              <Text style={{
                fontSize: scale(12),
                color: colors.placeholder,
                marginTop: scale(4),
                textAlign: 'center'
              }}>
                Tap the heart icon on any car to add it to favorites
              </Text>
            </View>
          ) : null
        }
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
                  <Text style={{ fontSize: scale(12), color: colors.placeholder }}>{item.brand} • {item.category ? item.category.toUpperCase() : "STANDARD"}</Text>
                </View>
                <Pressable onPress={(e) => handleFavoritePress(item.id, e)}>
                  <Ionicons
                    name={isFavorite(item.id) ? "heart" : "heart-outline"}
                    size={scale(20)}
                    color={isFavorite(item.id) ? "#EF4444" : colors.placeholder}
                  />
                </Pressable>
              </View>

              <Image
                source={getAsset(item.image) || require('../../../assets/tesla-model-s-luxury.png')}
                style={{ width: '100%', height: scale(120), resizeMode: 'contain', marginBottom: scale(12) }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(16) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="local-gas-station" size={scale(14)} color={colors.placeholder} />
                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginLeft: scale(4) }}>{item.fuelType || "N/A"}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="people" size={scale(14)} color={colors.placeholder} />
                    <Text style={{ fontSize: scale(11), color: colors.placeholder, marginLeft: scale(4) }}>{item.seats || "N/A"}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: scale(16), fontWeight: '700', color: colors.primary }}>{item.price || 0} VND</Text>
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
