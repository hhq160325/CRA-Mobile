import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { useBookingExtensionPayment } from '../../hooks/useBookingExtensionPayment';
import { bookingExtensionService } from '../../../lib/api';
import { colors } from '../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface BookingExtensionPaymentProps {
    bookingId: string;
    onPaymentComplete?: () => void;
}

export const BookingExtensionPayment: React.FC<BookingExtensionPaymentProps> = ({
    bookingId,
    onPaymentComplete,
}) => {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

    const {
        loading,
        hasExtension,
        extensionPayment,
        isPending,
        error,
        checkPaymentStatus,
        handlePayOSCompletion,
    } = useBookingExtensionPayment(bookingId);

    // Check payment status on mount
    useEffect(() => {
        console.log(' BookingExtensionPayment: Checking payment status on mount for booking:', bookingId);
        checkPaymentStatus();
    }, [checkPaymentStatus]);

    // Refresh payment status when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log(' BookingExtensionPayment: Screen focused, refreshing payment status');
            checkPaymentStatus();
        }, [checkPaymentStatus])
    );

    // Add debugging for state changes
    useEffect(() => {
        console.log(' BookingExtensionPayment state:', {
            bookingId,
            loading,
            hasExtension,
            isPending,
            status: extensionPayment?.status,
            error
        });

        // Force re-render when isPending changes
        if (extensionPayment?.status === 'Paid' && isPending === true) {
            console.log(' DETECTED STALE STATE: Status is Paid but isPending is true, forcing refresh...');
            setTimeout(() => {
                checkPaymentStatus();
            }, 100);
        }
    }, [bookingId, loading, hasExtension, isPending, extensionPayment?.status, error, checkPaymentStatus]);

    const handleRequestPayment = async () => {
        if (!extensionPayment) {
            Alert.alert('Error', 'No extension payment found');
            return;
        }

        try {
            // Get PayOS payment URL
            const result = await bookingExtensionService.getBookingExtensionPaymentUrl(bookingId);

            if (result.error || !result.data) {
                Alert.alert('Error', result.error?.message || 'Failed to create payment URL');
                return;
            }

            // Navigate to PayOS WebView
            navigation.navigate('PayOSWebView' as any, {
                paymentUrl: result.data.checkoutUrl,
                bookingId: bookingId,
                returnScreen: 'BookingDetail',
            });
        } catch (err) {
            console.error('Payment request error:', err);
            Alert.alert('Error', 'Failed to initiate payment');
        }
    };

    // Handle PayOS success URL (called from WebView)
    const handlePayOSSuccess = async (paymentUrl: string) => {
        const result = await handlePayOSCompletion(paymentUrl);

        if (result?.success) {
            Alert.alert(
                'Payment Successful',
                'Your booking extension payment has been completed!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            onPaymentComplete?.();
                        },
                    },
                ]
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.morentBlue} />
                <Text style={styles.loadingText}>Checking payment status...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={checkPaymentStatus} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    if (!hasExtension || !extensionPayment) {
        return null; // No extension payment needed
    }

    // Direct status check to bypass any hook issues
    const directIsPending = extensionPayment.status.toLowerCase() === 'pending';
    const shouldShowButton = directIsPending;
    const shouldShowCompleted = !directIsPending;

    // Extra safety check - explicitly check for "Paid" status
    const isPaidStatus = extensionPayment.status.toLowerCase() === 'paid';
    const finalShowButton = directIsPending && !isPaidStatus;
    const finalShowCompleted = !directIsPending || isPaidStatus;

    console.log('🔍 Direct status check:', {
        status: extensionPayment.status,
        statusLower: extensionPayment.status.toLowerCase(),
        hookIsPending: isPending,
        directIsPending,
        isPaidStatus,
        shouldShowButton,
        shouldShowCompleted,
        finalShowButton,
        finalShowCompleted
    });

    return (
        <View key={`extension-payment-${bookingId}`} style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="schedule" size={24} color={colors.morentBlue} />
                <Text style={styles.title}>Booking Extension</Text>
            </View>

            <View style={styles.paymentInfo}>
                <View style={styles.row}>
                    <Text style={styles.label}>Extension Fee:</Text>
                    <Text style={styles.amount}>{extensionPayment.paidAmount.toLocaleString()} VND</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{extensionPayment.paymentMethod}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusDot,
                            {
                                backgroundColor:
                                    extensionPayment.status.toLowerCase() === 'cancelled' ||
                                        extensionPayment.status.toLowerCase() === 'canceled' ? colors.red :
                                        directIsPending ? colors.orange : colors.green
                            }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            {
                                color:
                                    extensionPayment.status.toLowerCase() === 'cancelled' ||
                                        extensionPayment.status.toLowerCase() === 'canceled' ? colors.red :
                                        directIsPending ? colors.orange : colors.green
                            }
                        ]}>
                            {extensionPayment.status}
                        </Text>
                    </View>
                </View>
            </View>

            {finalShowButton && (
                <Pressable
                    onPress={handleRequestPayment}
                    style={styles.paymentButton}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <MaterialIcons name="payment" size={20} color={colors.white} />
                            <Text style={styles.paymentButtonText}>Pay Extension Fee</Text>
                        </>
                    )}
                </Pressable>
            )}

            {finalShowCompleted && (
                <View style={styles.completedContainer}>
                    <MaterialIcons name="check-circle" size={20} color={colors.green} />
                    <Text style={styles.completedText}>Extension payment completed</Text>
                </View>
            )}
        </View>
    );
};

const styles = {
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: 16,
    },
    loadingText: {
        marginLeft: 8,
        color: colors.gray,
        fontSize: 14,
    },
    errorContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: 16,
        backgroundColor: colors.lightRed,
        borderRadius: 8,
        marginVertical: 8,
    },
    errorText: {
        flex: 1,
        marginLeft: 8,
        color: colors.red,
        fontSize: 14,
    },
    retryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.red,
        borderRadius: 6,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600' as const,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: 12,
    },
    title: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.black,
        flex: 1,
    },
    paymentInfo: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        paddingVertical: 6,
    },
    label: {
        fontSize: 14,
        color: colors.gray,
    },
    amount: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.morentBlue,
    },
    value: {
        fontSize: 14,
        color: colors.black,
    },
    statusContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500' as const,
    },
    paymentButton: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: colors.morentBlue,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    paymentButtonText: {
        marginLeft: 8,
        color: colors.white,
        fontSize: 16,
        fontWeight: '600' as const,
    },
    completedContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 8,
    },
    completedText: {
        marginLeft: 8,
        color: colors.green,
        fontSize: 14,
        fontWeight: '500' as const,
    },
};