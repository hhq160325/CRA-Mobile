'use client';

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { bookingsService, type Booking } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { colors } from '../../theme/colors';
import { scale, verticalScale } from '../../theme/scale';
import getAsset from '../../../lib/getAsset';
import Header from '../../components/Header/Header';
import { styles } from './styles/bookingsList.styles';

type StatusFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function BookingsListScreen() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const { user } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (!user?.id) {
      console.log('BookingsListScreen: No user ID found');
      setLoading(false);
      return;
    }

    console.log('BookingsListScreen: Fetching bookings for user', user.id);
    setLoading(true);

    try {
      const { data, error } = await bookingsService.getBookings(user.id);

      if (error) {
        console.log(
          'BookingsListScreen: No bookings found (this is normal for new users)',
        );
        setBookings([]);
      } else if (data) {
        console.log('BookingsListScreen: Received bookings', data.length);

        const sortedBookings = data.sort((a, b) => {
          const dateA = new Date(a.bookingDate || a.startDate).getTime();
          const dateB = new Date(b.bookingDate || b.startDate).getTime();
          return dateB - dateA;
        });
        setBookings(sortedBookings);
      } else {
        console.log('BookingsListScreen: No bookings data received');
        setBookings([]);
      }
    } catch (err) {
      console.log(
        'BookingsListScreen: Error fetching bookings (user may have no bookings yet)',
      );
      setBookings([]);
    }

    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      console.log('BookingsListScreen: Screen focused, refreshing bookings');
      fetchBookings();
    }, [fetchBookings]),
  );

  const onRefresh = useCallback(async () => {
    console.log('BookingsListScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((booking: Booking) => {
    // Filter by status
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    // Filter by search query
    if (!searchQuery || searchQuery.trim() === '') {
      return matchesStatus;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      booking.carName.toLowerCase().includes(normalizedQuery) ||
      (booking.bookingNumber && booking.bookingNumber.toLowerCase().includes(normalizedQuery)) ||
      booking.pickupLocation.toLowerCase().includes(normalizedQuery) ||
      booking.dropoffLocation.toLowerCase().includes(normalizedQuery) ||
      booking.id.toLowerCase().includes(normalizedQuery) ||
      (booking.addons && booking.addons.some(addon => addon.toLowerCase().includes(normalizedQuery)));

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'completed':
        return '#00B050';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.placeholder;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#dbeafe';
      case 'completed':
        return '#d1fae5';
      case 'cancelled':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <Pressable
      onPress={() => navigation.navigate('BookingDetail' as any, { id: item.id })}
      style={styles.bookingCard}>
      {/* Header: Car name and status */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.carName}>{item.carName}</Text>
          <Text style={styles.bookingId}>
            Booking ID: {item.bookingNumber || 'N/A'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(item.status) },
          ]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Car Image */}
      {item.carImage && (
        <View style={styles.carImageContainer}>
          <Image
            source={
              item.carImage.startsWith('http://') ||
                item.carImage.startsWith('https://')
                ? { uri: item.carImage }
                : getAsset(item.carImage)
            }
            style={styles.carImage}
          />
        </View>
      )}

      {/* Location */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionLabel}>ROUTE</Text>
        <Text style={styles.locationText}>
          {item.pickupLocation} → {item.dropoffLocation}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailColumn}>
          <Text style={styles.sectionLabel}>START DATE</Text>
          <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
        </View>
        <View style={styles.detailColumn}>
          <Text style={styles.sectionLabel}>END DATE</Text>
          <Text style={styles.detailValue}>{formatDate(item.endDate)}</Text>
        </View>
        <View style={styles.detailColumnRight}>
          <Text style={styles.sectionLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{item.totalPrice} VND</Text>
        </View>
      </View>

      {/* Add-ons */}
      {item.addons && item.addons.length > 0 && (
        <View style={styles.addonsSection}>
          <Text style={styles.sectionLabel}>ADD-ONS</Text>
          <Text style={styles.addonsText}>{item.addons.join(', ')}</Text>
        </View>
      )}

      {/* Action indicator */}
      <View style={styles.actionContainer}>
        <Text style={styles.actionText}>View Details</Text>
        <Text style={styles.actionArrow}>→</Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Bookings</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by car, booking ID, location, or add-ons..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      <FlatList
        style={styles.listContainer}
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.filterContainer}>
            {(
              ['all', 'upcoming', 'completed', 'cancelled'] as StatusFilter[]
            ).map(status => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                style={[
                  styles.filterButton,
                  statusFilter === status
                    ? styles.filterButtonActive
                    : styles.filterButtonInactive,
                ]}>
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === status
                      ? styles.filterTextActive
                      : styles.filterTextInactive,
                  ]}>
                  {status === 'all' ? 'All' : status}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No bookings found for "${searchQuery}"`
                : statusFilter === 'all'
                  ? "No bookings found"
                  : `No ${statusFilter} bookings found`
              }
            </Text>
            {searchQuery && (
              <Text style={[styles.emptyText, { fontSize: scale(12), marginTop: verticalScale(8) }]}>
                Try searching for car name, booking ID, location, or add-ons
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}
