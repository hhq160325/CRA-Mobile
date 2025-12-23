import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
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
import { styles } from './styles/carList.styles';

export default function CarListScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await carsService.getCars({});
        if (mounted && res.data) {
          // Filter cars to only include rentable ones
          const rentableStatuses = ['Active', 'Reserved', 'Available'];
          const rentableCars = res.data.filter(car =>
            rentableStatuses.includes(car.status || ''),
          );

          // Fetch rental rates for each car to get accurate pricing
          const carsWithRates = await Promise.all(
            rentableCars.map(async car => {
              const rateResult = await carsService.getCarRentalRate(car.id);

              if (
                rateResult.data &&
                rateResult.data.status === 'Active' &&
                rateResult.data.dailyRate > 0
              ) {
                return { ...car, price: rateResult.data.dailyRate };
              }

              // Keep car but with 0 price if no active rental rate
              return { ...car, price: 0 };
            }),
          );

          setCars(carsWithRates);
        }
      } catch (error) {
        console.error('Error loading cars for favorites:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.morentBlue} />
        </View>
      </View>
    );
  }

  const displayedCars = cars.filter(car =>
    favorites.includes(car.id) && car.price > 0
  );

  const handleFavoritePress = (carId: string, e: any) => {
    e.stopPropagation();
    toggleFavorite(carId);
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Header Title */}
      <View style={styles.headerContainer}>
        <Ionicons
          name="heart"
          size={scale(20)}
          color={colors.morentBlue}
          style={{ marginRight: scale(8) }}
        />
        <Text style={styles.headerTitle}>
          My Favorite Cars ({favorites.length})
        </Text>
      </View>

      <FlatList
        data={displayedCars}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="heart-outline"
              size={scale(64)}
              color={colors.border}
            />
            <Text style={styles.emptyTitle}>
              No favorite cars yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Browse cars on the home screen and tap the heart icon to add them
              to your favorites
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('CarDetail' as any, { id: item.id })
            }
            style={styles.carCard}>
            <View style={styles.carCardContent}>
              <View style={styles.carHeader}>
                <View style={styles.carHeaderContent}>
                  <Text style={styles.carTitle}>
                    {item.name}
                  </Text>
                  <Text style={styles.carSubtitle}>
                    {item.brand} •{' '}
                    {item.category ? item.category.toUpperCase() : 'STANDARD'}
                  </Text>
                </View>
                <Pressable onPress={e => handleFavoritePress(item.id, e)}>
                  <Ionicons
                    name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                    size={scale(20)}
                    color={isFavorite(item.id) ? '#EF4444' : colors.placeholder}
                  />
                </Pressable>
              </View>

              <Image
                source={(() => {
                  // Try to get image from multiple sources
                  const imageUrl = item.image || item.imageUrls?.[0] || item.images?.[0];

                  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
                    return { uri: imageUrl };
                  }

                  return getAsset(imageUrl) || require('../../../assets/tesla-model-s-luxury.png');
                })()}
                style={styles.carImage}
              />

              <View style={styles.carFooter}>
                <View style={styles.carSpecs}>
                  <View style={styles.carSpecItem}>
                    <MaterialIcons
                      name="settings"
                      size={scale(14)}
                      color={colors.placeholder}
                    />
                    <Text style={styles.carSpecText}>
                      {item.transmission || 'Automatic'}
                    </Text>
                  </View>
                  <View style={styles.carSpecItem}>
                    <MaterialIcons
                      name="people"
                      size={scale(14)}
                      color={colors.placeholder}
                    />
                    <Text style={styles.carSpecText}>
                      {item.seats || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    {(item.price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND
                  </Text>
                  <Text style={styles.priceUnit}>
                    /day
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
