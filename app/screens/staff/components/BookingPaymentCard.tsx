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
    // Simplified debug logging for booking status
    if (__DEV__) {
        console.log(` ${item.bookingNumber || item.id.substring(0, 8)}: Status=${item.status}, RentalPaid=${item.paymentDetails?.isRentalFeePaid}, CheckIn=${item.hasCheckIn}, CheckOut=${item.hasCheckOut}`);
    }

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
                        {item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND
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
                        <Text style={styles.extensionLabel}>🔔 BOOKING EXTENSION</Text>
                        <Text style={[
                            styles.extensionStatus,
                            item.isExtensionPaymentCompleted
                                ? styles.extensionStatusCompleted
                                : styles.extensionStatusPending
                        ]}>
                            {item.isExtensionPaymentCompleted ? 'Payment Completed' : 'Payment Required'}
                        </Text>
                    </View>
                    <View style={styles.extensionDetails}>
                        <Text style={styles.extensionDescription}>
                            {item.extensionDescription || 'Extension requested'}
                        </Text>
                        {item.extensionAmount && (
                            <Text style={styles.extensionAmount}>
                                Amount: {item.extensionAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} VND
                            </Text>
                        )}
                        {item.extensionDays && (
                            <Text style={styles.extensionDays}>
                                Extended for {item.extensionDays} day{item.extensionDays > 1 ? 's' : ''}
                            </Text>
                        )}
                        {item.extensionPaymentStatus && (
                            <Text style={styles.extensionPaymentStatusText}>
                                Status: {item.extensionPaymentStatus}
                            </Text>
                        )}
                    </View>
                    {onPayExtension && !item.isExtensionPaymentCompleted && (
                        <Pressable
                            onPress={() => onPayExtension(item.id)}
                            disabled={processingExtensionPayment === item.id}
                            style={[
                                styles.extensionPaymentButton,
                                processingExtensionPayment === item.id
                                    ? styles.extensionPaymentButtonDisabled
                                    : styles.extensionPaymentButtonActive,
                            ]}>
                            {processingExtensionPayment === item.id ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.extensionPaymentText}>Request Extension Payment</Text>
                            )}
                        </Pressable>
                    )}
                    {item.isExtensionPaymentCompleted && (
                        <View style={styles.extensionPaymentCompleted}>
                            <Text style={styles.extensionPaymentCompletedText}>Extension payment completed</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.cardFooter}>
                {/* CRITICAL FIX: Handle status inconsistencies */}
                {(() => {
                    // If status is "successfully" but showing wrong button, force correct logic
                    if (item.status === 'successfully' && item.hasCheckIn && item.hasCheckOut) {
                        // Completed booking - should show view details
                        return (
                            <Pressable
                                onPress={() => onNavigateToPickup(item.id)}
                                style={styles.confirmPickupButton}>
                                <Text style={[styles.confirmPickupText, styles.confirmPickupTextComplete]}>
                                    → View booking details
                                </Text>
                                <Text style={[styles.confirmPickupArrow, styles.confirmPickupTextComplete]}>→</Text>
                            </Pressable>
                        );
                    }

                    // Original logic for other cases
                    if (!item.paymentDetails?.isRentalFeePaid) {
                        // Step 1-3: Rental fee not yet paid - show request/complete payment button
                        return (
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
                                    <Text style={styles.requestPaymentText}>
                                        {item.paymentDetails?.rentalFeePayment
                                            ? 'Complete Rental Payment'
                                            : 'Request Rental Payment'}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    } else {
                        // Step 4: Rental fee is paid - show pickup confirmation button
                        return (
                            <Pressable
                                onPress={() => onNavigateToPickup(item.id)}
                                style={styles.confirmPickupButton}>
                                <Text style={confirmPickupTextStyle}>
                                    {!item.hasCheckIn
                                        ? '→ Tap to confirm pickup (Rental Fee Paid)'
                                        : item.hasCheckIn && !item.hasCheckOut
                                            ? '→ Tap to confirm return'
                                            : '→ View booking details'}
                                </Text>
                                <Text style={confirmPickupArrowStyle}>→</Text>
                            </Pressable>
                        );
                    }
                })()}
            </View>
        </Pressable>
    );
}