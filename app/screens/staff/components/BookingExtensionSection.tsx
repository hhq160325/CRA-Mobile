import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { bookingExtensionService } from '../../../../lib/api/services/bookingExtension.service';
import { fetchBookingExtensionInfo } from '../utils/staffHelpers';
import type { NavigatorParamList } from '../../../navigators/navigation-route';
import { styles } from '../styles/additionalPaymentSection.styles';

interface BookingExtensionSectionProps {
    bookingId: string;
    allowPayment?: boolean;
    onPaymentStatusChange?: (isCompleted: boolean) => void;
}

export default function BookingExtensionSection({ bookingId, allowPayment = true, onPaymentStatusChange }: BookingExtensionSectionProps) {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const [loading, setLoading] = useState(false);
    const [extensionInfo, setExtensionInfo] = useState<{
        hasExtension: boolean;
        amount?: number;
        description?: string;
        days?: number;
        paymentStatus?: string;
        isPaymentCompleted?: boolean;
    }>({ hasExtension: false });
    const [checkingExtension, setCheckingExtension] = useState(true);

    useEffect(() => {
        checkForBookingExtension();
    }, [bookingId]);

    // Refresh payment status when screen comes into focus (after returning from payment)
    useFocusEffect(
        React.useCallback(() => {
            if (extensionInfo.hasExtension) {
                // console.log(' BookingExtensionSection: Screen focused, refreshing payment status');
                checkForBookingExtension();
            }
        }, [extensionInfo.hasExtension])
    );

    const checkExtensionPaymentStatus = async (bookingId: string, amount: number, description: string, days: number) => {
        try {

            const bookingResult = await bookingExtensionService.getBookingById(bookingId);
            if (!bookingResult.data?.invoiceId) {
                // console.log(' BookingExtensionSection: No invoiceId found');
                const info = {
                    hasExtension: true,
                    amount,
                    description,
                    days,
                    paymentStatus: 'Pending',
                    isPaymentCompleted: false
                };
                setExtensionInfo(info);
                onPaymentStatusChange?.(false);
                return;
            }


            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
            const paymentUrl = `${baseUrl}/Invoice/${bookingResult.data.invoiceId}`;

            const response = await fetch(paymentUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
            });

            if (response.ok) {
                const paymentData = await response.json();
                const extensionPayment = paymentData.find((payment: any) =>
                    payment.item === 'Booking Extension'
                );

                const paymentStatus = extensionPayment?.status || 'Pending';
                const isPaymentCompleted = paymentStatus.toLowerCase() === 'success';

                const info = {
                    hasExtension: true,
                    amount,
                    description,
                    days,
                    paymentStatus,
                    isPaymentCompleted
                };

                setExtensionInfo(info);
                onPaymentStatusChange?.(isPaymentCompleted);

                // console.log(' BookingExtensionSection: Payment status checked:', {
                //     paymentStatus,
                //     isPaymentCompleted
                // });
            } else {
                const info = {
                    hasExtension: true,
                    amount,
                    description,
                    days,
                    paymentStatus: 'Pending',
                    isPaymentCompleted: false
                };
                setExtensionInfo(info);
                onPaymentStatusChange?.(false);
            }
        } catch (error) {
            // console.error(' BookingExtensionSection: Error checking payment status:', error);
            const info = {
                hasExtension: true,
                amount,
                description,
                days,
                paymentStatus: 'Pending',
                isPaymentCompleted: false
            };
            setExtensionInfo(info);
            onPaymentStatusChange?.(false);
        }
    };

    const checkForBookingExtension = async () => {
        try {
            setCheckingExtension(true);
            // console.log(' BookingExtensionSection: Checking for booking extension:', bookingId);


            const extensionInfo = await fetchBookingExtensionInfo(bookingId);

            // console.log(' BookingExtensionSection: Extension info result:', extensionInfo);

            if (extensionInfo.hasExtension && extensionInfo.extensionDescription) {

                const daysMatch = extensionInfo.extensionDescription.match(/(\d+)\s+days?/i);
                const days = daysMatch ? parseInt(daysMatch[1]) : extensionInfo.extensionDays || 1;


                await checkExtensionPaymentStatus(bookingId, extensionInfo.extensionAmount || 0, extensionInfo.extensionDescription, days);
            } else {
                // console.log(' BookingExtensionSection: No booking extension found');
                setExtensionInfo({ hasExtension: false });
                onPaymentStatusChange?.(true);
            }

        } catch (error) {
            // console.error(' BookingExtensionSection: Error checking booking extension:', error);
            setExtensionInfo({ hasExtension: false });
        } finally {
            setCheckingExtension(false);
        }
    };

    const handlePayExtension = async () => {
        try {
            setLoading(true);
            // console.log(' Starting extension payment for booking:', bookingId);

            const result = await bookingExtensionService.getBookingExtensionPaymentUrl(bookingId);

            if (result.error || !result.data) {
                Alert.alert(
                    'Payment Error',
                    result.error?.message || 'Failed to create payment URL'
                );
                return;
            }

            // console.log(' Payment URL created:', result.data.checkoutUrl);


            navigation.navigate('PayOSWebView', {
                paymentUrl: result.data.checkoutUrl,
                bookingId: bookingId
            });

        } catch (error) {
            // console.error(' Error creating extension payment:', error);
            Alert.alert(
                'Error',
                'Failed to process extension payment. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (checkingExtension) {
        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="schedule" size={24} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Checking Extension...</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading extension details...</Text>
                </View>
            </View>
        );
    }


    // console.log(' BookingExtensionSection: Render decision:', {
    //     bookingId,
    //     checkingExtension,
    //     hasExtension: extensionInfo.hasExtension,
    //     description: extensionInfo.description,
    //     amount: extensionInfo.amount
    // });

    if (!extensionInfo.hasExtension) {
        // console.log(' BookingExtensionSection: No extension found, not rendering component');
        return null;
    }

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <MaterialIcons name="schedule" size={24} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Booking Extension</Text>
            </View>

            <View style={styles.extensionInfo}>
                <View style={styles.extensionDetails}>
                    <Text style={styles.extensionDescription}>
                        {extensionInfo.description}
                    </Text>
                    <Text style={styles.extensionAmount}>
                        Amount: {extensionInfo.amount?.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }) || '₫0'}
                    </Text>
                    {extensionInfo.days && (
                        <Text style={styles.extensionDays}>
                            Extended for {extensionInfo.days} day{extensionInfo.days > 1 ? 's' : ''}
                        </Text>
                    )}
                    {extensionInfo.paymentStatus && (
                        <Text style={[
                            styles.extensionPaymentStatus,
                            extensionInfo.isPaymentCompleted
                                ? styles.extensionPaymentStatusSuccess
                                : styles.extensionPaymentStatusPending
                        ]}>
                            Payment Status: {extensionInfo.paymentStatus}
                        </Text>
                    )}
                </View>

                {allowPayment && !extensionInfo.isPaymentCompleted && (
                    <Pressable
                        style={[
                            styles.paymentButton,
                            loading && styles.paymentButtonDisabled
                        ]}
                        onPress={handlePayExtension}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <MaterialIcons name="payment" size={20} color="white" />
                                <Text style={styles.paymentButtonText}>Request Payment Extension</Text>
                            </>
                        )}
                    </Pressable>
                )}

                {extensionInfo.isPaymentCompleted && (
                    <View style={styles.paymentCompletedContainer}>
                        <MaterialIcons name="check-circle" size={20} color="#10b981" />
                        <Text style={styles.paymentCompletedText}>Payment Completed</Text>
                    </View>
                )}
            </View>

            <View style={styles.extensionNote}>
                <MaterialIcons name="info" size={16} color="#6b7280" />
                <Text style={styles.extensionNoteText}>
                    This booking was extended during the rental period.
                </Text>
            </View>
        </View>
    );
}