'use client';

import React from 'react';
import { View, FlatList, RefreshControl, Pressable, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useStaffBookings } from './hooks/useStaffBookings';
import { ListHeader } from './components/ListHeader';
import BookingPaymentCard from './components/BookingPaymentCard';
import StaffLoadingState from './components/StaffLoadingState';
import StaffErrorState from './components/StaffErrorState';
import StaffEmptyState from './components/StaffEmptyState';
import { styles } from './styles/staffScreen.styles';
import type { BookingItem } from './types/staffTypes';

export default function StaffScreen() {
  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    error,
    processingPayment,
    processingExtensionPayment,
    filteredPayments,
    loadingProgress,
    showingRecentOnly,
    totalBookingsCount,
    loadingMore,
    onRefresh,
    handleRequestPayment,
    handlePayExtension,
    loadAllBookings,
    navigation,
  } = useStaffBookings();

  const [showLoadingAnimation, setShowLoadingAnimation] = React.useState(true);
  const [loadingComplete, setLoadingComplete] = React.useState(false);


  React.useEffect(() => {
    if (!loading && showLoadingAnimation) {

      setLoadingComplete(true);
    }
  }, [loading, showLoadingAnimation]);

  const handleAnimationComplete = () => {

    setShowLoadingAnimation(false);
    setLoadingComplete(false);
  };

  const handleNavigateToPickup = (bookingId: string) => {

    const bookingItem = filteredPayments.find(item => item.id === bookingId);

    if (bookingItem?.hasCheckIn && !bookingItem?.hasCheckOut) {

      navigation.navigate('VehicleReturn' as any, {
        bookingId: bookingId,
      });
    } else {

      navigation.navigate('PickupReturnConfirm' as any, {
        bookingId: bookingId,
      });
    }
  };

  const renderLoadMoreFooter = () => {
    if (!showingRecentOnly) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <Text style={styles.loadMoreInfo}>
          Showing {filteredPayments.length} most recent bookings out of {totalBookingsCount} total
        </Text>
        <Pressable
          onPress={loadAllBookings}
          disabled={loadingMore}
          style={[
            styles.loadMoreButton,
            loadingMore && styles.loadMoreButtonDisabled
          ]}>
          {loadingMore ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.loadMoreButtonText}>
              Load All Bookings ({totalBookingsCount - filteredPayments.length} more)
            </Text>
          )}
        </Pressable>
      </View>
    );
  };

  const renderPaymentCard = ({ item }: { item: BookingItem }) => (
    <BookingPaymentCard
      item={item}
      processingPayment={processingPayment}
      processingExtensionPayment={processingExtensionPayment}
      onRequestPayment={handleRequestPayment}
      onNavigateToPickup={handleNavigateToPickup}
      onPayExtension={handlePayExtension}
    />
  );

  return (
    <View style={styles.container}>
      <Header />

      {showLoadingAnimation ? (
        <StaffLoadingState
          isComplete={loadingComplete}
          onAnimationComplete={handleAnimationComplete}
        />
      ) : error ? (
        <StaffErrorState error={error} />
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filteredPayments}
          renderItem={renderPaymentCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <ListHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
          }
          ListEmptyComponent={<StaffEmptyState />}
          ListFooterComponent={renderLoadMoreFooter}
        />
      )}
    </View>
  );
}
