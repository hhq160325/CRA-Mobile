'use client';

import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
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
    onRefresh,
    handleRequestPayment,
    handlePayExtension,
    navigation,
  } = useStaffBookings();

  const handleNavigateToPickup = (bookingId: string) => {
    navigation.navigate('PickupReturnConfirm' as any, {
      bookingId: bookingId,
    });
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

      {loading ? (
        <StaffLoadingState />
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
        />
      )}
    </View>
  );
}
