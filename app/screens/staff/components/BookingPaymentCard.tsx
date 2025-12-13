import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../styles/staffScreen.styles';
import type { BookingItem } from '../types/staffTypes';

interface BookingPaymentCardProps {
    item: BookingItem;
    processingPayment: string | null;
    onRequestPayment: (bookingId: string) => void;
    onNavigateToPickup: (bookingId: string) => void;
    onPayExtension?: (bookingId: string) => void;
    processingExtensionPayment?: string | null;
}

export default function BookingPaymentCard({
    item,
    processingPayment,
    onRequestPayment,
    onNavigateToPickup,
    onPayExtension,
    processingExtensionPayment
}: BookingPaymentCardProps) {
    const statusBadgeStyle = [
        styles.statusBadge,
        item.status === 'successfully'
            ? styles.statusBadgeSuccess
            : item.status === 'cancelled'
                ? styles.statusBadgeCancelled
                : styles.statusBadgePending,
    ];

    const statusTextStyle = [
        styles.statusText,
        item.status === 'successfully'
            ? styles.statusTextSuccess
            : item.status === 'cancelled'
                ? styles.statusTextCancelled
                : styles.statusTextPending,
    ];

    const confirmPickupTextStyle = [
        styles.confirmPickupText,
        item.hasCheckIn && item.hasCheckOut
            ? styles.confirmPickupTextComplete
            : styles.confirmPickupTextIncomplete,
    ];

    const confirmPickupArrowStyle = [
        styles.confirmPickupArrow,
        item.hasCheckIn && item.hasCheckOut
            ? styles.confirmPickupTextComplete
            : styles.confirmPickupTextIncomplete,
    ];

    return (
        <Pressable style={styles.paymentCard}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderContent}>
                    <Text style={styles.carName}>{item.carName}</Text>
                    {item.carLicensePlate && (
                        <Text style={styles.licensePlate}>
                            License: {item.carLicensePlate}
                        </Text>
                    )}
                    <Text style={styles.bookingId}>
                        Booking ID: {item.bookingNumber || 'N/A'}
                    </Text>
                </View>
                <View style={statusBadgeStyle}>
                    <Text style={statusTextStyle}>
                        {item.status === 'successfully'
                            ? 'Successful'
                            : item.status === 'cancelled'
                                ? 'Cancelled'
                                : 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>CUSTOMER</Text>
                    <Text style={styles.detailValue}>{item.customerName}</Text>
                </View>
                <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>AMOUNT</Text>
                    <Text style={[styles.detailValue, styles.detailValueBold]}>
                        {item.amount.toLocaleString()} VND
                    </Text>
                </View>
                <View style={styles.detailColumn}>
                    <Text style={styles.detailLabel}>DATE</Text>
                    <Text style={styles.detailValue}>{item.date}</Text>
                </View>
            </View>

            {/* Booking Extension Information */}
            {item.hasExtension && (
                <View style={styles.extensionInfo}>
                    <View style={styles.extensionHeader}>
                        <Text style={styles.extensionLabel}>BOOKING EXTENSION</Text>
                    </View>
                </View>
            )}

            <View style={styles.cardFooter}>
                {item.status === 'pending' ? (
                    <Pressable
                        onPress={() => onRequestPayment(item.id)}
                        disabled={processingPayment === item.id}
                        style={[
                            styles.requestPaymentButton,
                            processingPayment === item.id
                                ? styles.requestPaymentButtonDisabled
                                : styles.requestPaymentButtonActive,
                        ]}>
                        {processingPayment === item.id ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Text style={styles.requestPaymentText}>Request Payment</Text>
                        )}
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={() => onNavigateToPickup(item.id)}
                        style={styles.confirmPickupButton}>
                        <Text style={confirmPickupTextStyle}>
                            → Tap to confirm pickup
                        </Text>
                        <Text style={confirmPickupArrowStyle}>→</Text>
                    </Pressable>
                )}
            </View>
        </Pressable>
    );
}