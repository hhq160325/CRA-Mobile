'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale } from '../../theme/scale';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header/Header';

import SearchBar from './components/SearchBar';
import ActiveFilters from './components/ActiveFilters';
import FilterModal from './components/FilterModal';
import CarCard from './components/CarCard';
import PickupDropoffSection from './components/PickupDropoffSection';
import DonutChart from './components/DonutChart';
import StaffLoadingState from '../staff/components/StaffLoadingState';

import { useCarFilters } from './hooks/useCarFilters';
import { useHomeData } from './hooks/useHomeData';
import { useLanguage } from '../../../lib/language-context';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const { t } = useLanguage();

  const { cars, loading } = useHomeData();

  const {
    searchQuery,
    setSearchQuery,
    maxPrice,
    setMaxPrice,
    selectedType,
    setSelectedType,
    selectedSeats,
    setSelectedSeats,
    filteredCars,
    clearFilters,
    hasActiveFilters,
  } = useCarFilters(cars);

  const popularCars = filteredCars.slice(0, 3);
  const recommendedCars = filteredCars.slice(3, 8);

  // Handle loading state changes for car animation
  useEffect(() => {
    if (!loading && showLoadingAnimation) {
      // Loading just finished, trigger completion animation
      setLoadingComplete(true);
    }
  }, [loading, showLoadingAnimation]);

  const handleAnimationComplete = () => {
    // Hide loading animation completely after exit animation
    setShowLoadingAnimation(false);
    setLoadingComplete(false);
  };

  if (showLoadingAnimation) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header />
        <StaffLoadingState
          progress="Loading cars..."
          isComplete={loadingComplete}
          onAnimationComplete={handleAnimationComplete}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <ScrollView style={{ flex: 1 }}>
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={() => setFilterVisible(true)}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Active Filters */}
        {hasActiveFilters && (
          <ActiveFilters
            maxPrice={maxPrice}
            selectedType={selectedType}
            selectedSeats={selectedSeats}
            onRemovePrice={() => setMaxPrice(null)}
            onRemoveType={() => setSelectedType(null)}
            onRemoveSeats={() => setSelectedSeats(null)}
            onClearAll={clearFilters}
          />
        )}

        {/* Pickup & Dropoff Section */}
        <PickupDropoffSection />

        {/* Popular Cars */}
        <View style={{ marginBottom: scale(24) }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: scale(16),
              marginBottom: scale(12),
            }}>
            <Text style={{ fontSize: scale(14), color: colors.placeholder }}>
              {t('popularCar')}
            </Text>
            <Pressable onPress={() => navigation.navigate('AllCars' as any)}>
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.morentBlue,
                  fontWeight: '600',
                }}>
                {t('viewAll')}
              </Text>
            </Pressable>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularCars}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingHorizontal: scale(16) }}
            renderItem={({ item }) => (
              <CarCard
                car={item}
                isHorizontal={true}
                onPress={() =>
                  navigation.navigate('CarDetail' as any, { id: item.id })
                }
                onRentPress={() =>
                  navigation.navigate('BookingForm' as any, { id: item.id })
                }
              />
            )}
          />
        </View>

        {/* Recommended Cars */}
        <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: scale(12),
            }}>
            <Text style={{ fontSize: scale(14), color: colors.placeholder }}>
              {t('recommendationCar')}
            </Text>
            <Pressable onPress={() => navigation.navigate('AllCars' as any)}>
              <Text
                style={{
                  fontSize: scale(12),
                  color: colors.morentBlue,
                  fontWeight: '600',
                }}>
                {t('viewAll')}
              </Text>
            </Pressable>
          </View>

          {recommendedCars.map(car => (
            <CarCard
              key={car.id}
              car={car}
              isHorizontal={false}
              onPress={() =>
                navigation.navigate('CarDetail' as any, { id: car.id })
              }
              onRentPress={() =>
                navigation.navigate('BookingForm' as any, { id: car.id })
              }
            />
          ))}
        </View>

        {/* Top 5 Car Rental Chart */}
        <View style={{ paddingHorizontal: scale(16), marginBottom: scale(24) }}>
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 10,
              padding: scale(16),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: scale(16),
              }}>
              <Text
                style={{
                  fontSize: scale(14),
                  fontWeight: '600',
                  color: colors.primary,
                }}>
                {t('topCarRental')}
              </Text>
              <MaterialIcons
                name="more-vert"
                size={scale(20)}
                color={colors.placeholder}
              />
            </View>

            <DonutChart />
          </View>
        </View>


      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        maxPrice={maxPrice}
        selectedType={selectedType}
        selectedSeats={selectedSeats}
        onPriceChange={setMaxPrice}
        onTypeChange={setSelectedType}
        onSeatsChange={setSelectedSeats}
        onClearAll={clearFilters}
      />
    </View>
  );
}
