import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import { calculateTotal } from '../utils/paymentUtils';
import PaymentItem from './PaymentItem';
import { styles } from '../styles/bookingPaymentCard.styles';
import type { BookingPayments } from '../types/paymentTypes';

interface BookingPaymentCardProps {
    booking: BookingPayments;
    isExpanded: boolean;
    onToggleExpanded: (bookingId: string) => void;
}

export default function BookingPaymentCard({
    booking,
    isExpanded,
    onToggleExpanded
}: BookingPaymentCardProps) {
    const totalAmount = calculateTotal(booking.payments);

    return (
        <Pressable
            onPress={() => onToggleExpanded(booking.bookingId)}
            style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <View style={styles.bookingHeaderContent}>
                    <Text style={styles.carName}>{booking.carName}</Text>
                    <Text style={styles.bookingId}>
                        Booking ID: {booking.bookingNumber || 'N/A'}
                    </Text>
                </View>
                <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={scale(24)}
                    color={colors.primary}
                />
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                    {totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND
                </Text>
            </View>

            {isExpanded && (
                <View style={styles.expandedSection}>
                    {booking.payments.map((payment, index) => (
                        <PaymentItem
                            key={payment.orderCode}
                            payment={payment}
                            index={index}
                            totalItems={booking.payments.length}
                        />
                    ))}
                </View>
            )}
        </Pressable>
    );
}