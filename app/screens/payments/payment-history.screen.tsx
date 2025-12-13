'use client';

import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { usePaymentHistory } from './hooks/usePaymentHistory';
import PaymentHistoryHeader from './components/PaymentHistoryHeader';
import BookingPaymentCard from './components/BookingPaymentCard';
import PaymentLoadingState from './components/PaymentLoadingState';
import PaymentErrorState from './components/PaymentErrorState';
import PaymentEmptyState from './components/PaymentEmptyState';
import { styles } from './styles/paymentHistoryScreen.styles';
import type { BookingPayments } from './types/paymentTypes';

export default function PaymentHistoryScreen() {
  const {
    filteredBookingPayments,
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    error,
    expandedBookings,
    onRefresh,
    toggleExpanded,
  } = usePaymentHistory();

  const renderBookingPayments = ({ item }: { item: BookingPayments }) => {
    const isExpanded = expandedBookings.has(item.bookingId);

    return (
      <BookingPaymentCard
        booking={item}
        isExpanded={isExpanded}
        onToggleExpanded={toggleExpanded}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <PaymentHistoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <PaymentLoadingState />
      ) : error ? (
        <PaymentErrorState error={error} />
      ) : (
        <FlatList
          data={filteredBookingPayments}
          renderItem={renderBookingPayments}
          keyExtractor={item => item.bookingId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={<PaymentEmptyState searchQuery={searchQuery} />}
        />
      )}
    </View>
  );
}
