import React, { useEffect } from 'react';
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
import { useAdditionalFeePayment } from '../../hooks/useAdditionalFeePayment';
import { bookingExtensionService } from '../../../lib/api';
import { colors } from '../../theme/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface AdditionalFeePaymentProps {
    bookingId: string;
    onPaymentComplete?: () => void;
}

export const AdditionalFeePayment: React.FC<AdditionalFeePaymentProps> = ({
    bookingId,
    onPaymentComplete,
}) => {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const {
        loading,
        hasAdditionalFee,
        additionalFeePayment,
        isPending,
        error,
        checkPaymentStatus,
        handlePayOSCompletion,
    } = useAdditionalFeePayment(bookingId);

    // Check payment status on mount
    useEffect(() => {
        console.log(' AdditionalFeePayment: Checking payment status on mount for booking:', bookingId);
        checkPaymentStatus();
    }, [checkPaymentStatus]);

    // Refresh payment status when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log(' AdditionalFeePayment: Screen focused, refreshing payment status');
            checkPaymentStatus();
        }, [checkPaymentStatus])
    );

    // Add debugging for state changes
    useEffect(() => {
        console.log(' AdditionalFeePayment state:', {
            bookingId,
            loading,
            hasAdditionalFee,
            isPending,
            status: additionalFeePayment?.status,
            error
        });
    }, [bookingId, loading, hasAdditionalFee, isPending, additionalFeePayment?.status, error]);

    const handleRequestPayment = async () => {
        if (!additionalFeePayment) {
            Alert.alert('Error', 'No additional fee payment found');
            return;
        }

        try {

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
            console.error('Additional fee payment request error:', err);
            Alert.alert('Error', 'Failed to initiate additional fee payment');
        }
    };

    // Handle PayOS success URL (called from WebView)
    const handlePayOSSuccess = async (paymentUrl: string) => {
        const result = await handlePayOSCompletion(paymentUrl);

        if (result?.success) {
            Alert.alert(
                'Payment Successful',
                'Your additional fee payment has been completed!',
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
                <Text style={styles.loadingText}>Checking additional fee status...</Text>
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

    if (!hasAdditionalFee || !additionalFeePayment) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="attach-money" size={24} color={colors.orange} />
                <Text style={styles.title}>Additional Fee</Text>
                <Pressable onPress={checkPaymentStatus} style={styles.refreshButton}>
                    <MaterialIcons name="refresh" size={20} color={colors.orange} />
                </Pressable>
            </View>

            <View style={styles.paymentInfo}>
                <View style={styles.row}>
                    <Text style={styles.label}>Additional Fee:</Text>
                    <Text style={styles.amount}>{additionalFeePayment.paidAmount.toLocaleString()} VND</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{additionalFeePayment.paymentMethod}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: isPending ? colors.orange : colors.green }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: isPending ? colors.orange : colors.green }
                        ]}>
                            {additionalFeePayment.status}
                        </Text>
                    </View>
                </View>
            </View>

            {isPending && (
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
                            <Text style={styles.paymentButtonText}>Pay Additional Fee</Text>
                        </>
                    )}
                </Pressable>
            )}

            {!isPending && (
                <View style={styles.completedContainer}>
                    <MaterialIcons name="check-circle" size={20} color={colors.green} />
                    <Text style={styles.completedText}>Additional fee payment completed</Text>
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
    refreshButton: {
        padding: 4,
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
        color: colors.orange,
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
        backgroundColor: colors.orange,
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