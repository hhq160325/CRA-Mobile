import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from './AdditionalPaymentSection.styles';

interface AdditionalFee {
    id: string;
    name: string;
    amount: number;
    description: string;
    icon: string;
}

const ADDITIONAL_FEES: AdditionalFee[] = [
    {
        id: 'overtime',
        name: 'Overtime Fee',
        amount: 70000,
        description: 'VND 70,000/hour - Late return surcharge. Over 5 hours = extra day.',
        icon: 'schedule',
    },
    {
        id: 'cleaning',
        name: 'Cleaning Fee',
        amount: 70000,
        description: 'VND 70,000 - Unsanitary return (stains, mud, etc.)',
        icon: 'cleaning-services',
    },
    {
        id: 'deodorization',
        name: 'Deodorization Fee',
        amount: 500000,
        description: 'VND 500,000 - Unpleasant odor (smoke, food smell, etc.)',
        icon: 'air',
    },
];

interface PaymentResponse {
    orderCode: number;
    payOSLink: string;
    item3: {
        id: string;
        orderCode: number;
        item: string;
        paidAmount: number;
        createDate: string;
        updateDate: string;
        paymentMethod: string;
        status: string;
        invoiceId: string;
        userId: string;
    };
}

interface AdditionalPaymentSectionProps {
    bookingId: string;
    onPaymentAdded?: () => void;
    onNavigateToReturn?: () => void;
}

export default function AdditionalPaymentSection({
    bookingId,
    onPaymentAdded,
    onNavigateToReturn,
}: AdditionalPaymentSectionProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);
    const [overtimeHours, setOvertimeHours] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
    const [showWebView, setShowWebView] = useState(false);

    const toggleFee = (feeId: string) => {
        setSelectedFees(prev =>
            prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId],
        );
    };

    const calculateTotal = () => {
        return selectedFees.reduce((total, feeId) => {
            const fee = ADDITIONAL_FEES.find(f => f.id === feeId);
            if (!fee) return total;
            if (feeId === 'overtime') {
                return total + fee.amount * overtimeHours;
            }
            return total + fee.amount;
        }, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const buildPaymentDescription = () => {
        return selectedFees
            .map(feeId => {
                const fee = ADDITIONAL_FEES.find(f => f.id === feeId);
                if (feeId === 'overtime') {
                    return `${fee?.name} (${overtimeHours}h)`;
                }
                return fee?.name;
            })
            .join(', ');
    };

    const createAdditionalPayment = async (description: string, amount: number): Promise<PaymentResponse> => {
        const response = await fetch(
            'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/CreateAdditionalPayment',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*',
                },
                body: JSON.stringify({
                    bookingId: bookingId,
                    description: description,
                    amount: amount,
                }),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to create additional payment');
        }

        const data = await response.json();
        return data;
    };

    const resetForm = () => {
        setModalVisible(false);
        setSelectedFees([]);
        setOvertimeHours(1);
        setPaymentResponse(null);
        setShowWebView(false);
    };

    const handleSubmit = async () => {
        if (selectedFees.length === 0) {
            Alert.alert('Error', 'Please select at least one fee.');
            return;
        }

        setSubmitting(true);

        try {
            const description = buildPaymentDescription();
            const totalAmount = calculateTotal();

            const response = await createAdditionalPayment(description, totalAmount);

            console.log('Payment response:', response);

            // Store the payment response and directly open WebView
            setPaymentResponse(response);
            setModalVisible(false); // Close the fee selection modal
            setShowWebView(true); // Directly open WebView with PayOS link

            onPaymentAdded?.();
        } catch (error) {
            console.error('Error creating additional payment:', error);
            Alert.alert('Error', 'Failed to add additional payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };





    const renderOvertimeSelector = () => (
        <View style={styles.hoursSelector}>
            <Text style={styles.hoursLabel}>Hours:</Text>
            <Pressable
                style={styles.hoursButton}
                onPress={() => setOvertimeHours(Math.max(1, overtimeHours - 1))}>
                <MaterialIcons name="remove" size={18} color={colors.morentBlue} />
            </Pressable>
            <Text style={styles.hoursValue}>{overtimeHours}</Text>
            <Pressable
                style={styles.hoursButton}
                onPress={() => setOvertimeHours(Math.min(5, overtimeHours + 1))}>
                <MaterialIcons name="add" size={18} color={colors.morentBlue} />
            </Pressable>
        </View>
    );

    const renderFeeItem = (fee: AdditionalFee) => {
        const isSelected = selectedFees.includes(fee.id);

        return (
            <Pressable
                key={fee.id}
                style={[styles.feeItem, isSelected && styles.feeItemSelected]}
                onPress={() => toggleFee(fee.id)}>
                <View style={styles.feeHeader}>
                    <View style={styles.feeIconContainer}>
                        <MaterialIcons
                            name={fee.icon as any}
                            size={22}
                            color={isSelected ? colors.morentBlue : '#6b7280'}
                        />
                    </View>
                    <View style={styles.feeInfo}>
                        <Text style={styles.feeName}>{fee.name}</Text>
                        <Text style={styles.feeAmount}>
                            {formatCurrency(fee.amount)}
                            {fee.id === 'overtime' && '/hour'}
                        </Text>
                    </View>
                    <MaterialIcons
                        name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={isSelected ? colors.morentBlue : '#d1d5db'}
                    />
                </View>
                <Text style={styles.feeDescription}>{fee.description}</Text>

                {fee.id === 'overtime' && isSelected && renderOvertimeSelector()}
            </Pressable>
        );
    };

    const renderModalHeader = () => (
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Additional Fees</Text>
            <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
            </View>

            <Pressable
                style={[
                    styles.submitButton,
                    (submitting || selectedFees.length === 0) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting || selectedFees.length === 0}>
                {submitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <>
                        <MaterialIcons name="payment" size={18} color={colors.white} />
                        <Text style={styles.submitButtonText}>Add Payment</Text>
                    </>
                )}
            </Pressable>
        </View>
    );

    const renderWebViewModal = () => (
        <Modal
            visible={showWebView}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setShowWebView(false)}>
            {paymentResponse?.payOSLink && (
                <WebView
                    source={{ uri: paymentResponse.payOSLink }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
                        </View>
                    )}
                    onNavigationStateChange={(navState) => {
                        console.log('WebView navigation:', navState.url);

                        // Check for PayOS redirect URLs (external domain redirects)
                        if (navState.url.includes('cra-morent.vercel.app') ||
                            navState.url.includes('payment-success') ||
                            navState.url.includes('payment-cancel') ||
                            navState.url.includes('success=true') ||
                            navState.url.includes('cancel=true') ||
                            navState.url.includes('status=CANCELLED') ||
                            navState.url.includes('status=PAID') ||
                            navState.url.includes('/success/') ||
                            navState.url.includes('/cancel/') ||
                            navState.url.includes('/failure/')) {

                            console.log('🎯 Payment redirect detected:', navState.url);

                            // Determine if it's success or cancel/failure
                            const isSuccess = navState.url.includes('success=true') ||
                                navState.url.includes('status=PAID') ||
                                navState.url.includes('/success/') ||
                                navState.url.includes('payment-success');

                            const isCancel = navState.url.includes('cancel=true') ||
                                navState.url.includes('status=CANCELLED') ||
                                navState.url.includes('/cancel/') ||
                                navState.url.includes('/failure/') ||
                                navState.url.includes('payment-cancel');

                            // Immediately close WebView and navigate to return screen
                            setShowWebView(false);
                            resetForm();

                            if (isSuccess) {
                                console.log('✅ Payment completed successfully!');
                                Alert.alert(
                                    'Payment Successful',
                                    'Additional payment has been completed successfully! Proceeding to vehicle return.',
                                    [
                                        {
                                            text: 'Continue',
                                            onPress: () => {
                                                onNavigateToReturn?.();
                                            }
                                        }
                                    ]
                                );
                            } else if (isCancel) {
                                console.log('❌ Payment cancelled or failed');
                                Alert.alert(
                                    'Payment Cancelled',
                                    'Payment was cancelled by the customer. No additional fees were charged. Proceeding to vehicle return.',
                                    [
                                        {
                                            text: 'Continue',
                                            onPress: () => {
                                                onNavigateToReturn?.();
                                            }
                                        }
                                    ]
                                );
                            } else {
                                // Generic redirect handling
                                console.log('🔄 Payment process completed');
                                Alert.alert(
                                    'Payment Process Finished',
                                    'Payment process has finished. Proceeding to vehicle return.',
                                    [
                                        {
                                            text: 'Continue',
                                            onPress: () => {
                                                onNavigateToReturn?.();
                                            }
                                        }
                                    ]
                                );
                            }

                            return false; // Prevent further navigation
                        }
                    }}
                    onShouldStartLoadWithRequest={(request) => {
                        console.log('WebView should start load:', request.url);

                        // Allow PayOS domain and initial payment URL
                        if (request.url.includes('pay.payos.vn') ||
                            request.url.includes('payos.vn') ||
                            request.url === paymentResponse?.payOSLink) {
                            return true; // Allow navigation
                        }

                        // Check for PayOS redirect URLs - these should trigger navigation detection
                        if (request.url.includes('cra-morent.vercel.app') ||
                            request.url.includes('payment-success') ||
                            request.url.includes('payment-cancel') ||
                            request.url.includes('success=true') ||
                            request.url.includes('cancel=true') ||
                            request.url.includes('status=CANCELLED') ||
                            request.url.includes('status=PAID') ||
                            request.url.includes('/success/') ||
                            request.url.includes('/cancel/') ||
                            request.url.includes('/failure/')) {

                            console.log('🎯 PayOS redirect detected in shouldStart:', request.url);
                            // Allow this navigation so onNavigationStateChange can handle it
                            return true;
                        }

                        // Block any other external domains
                        console.log('🚫 Blocking external navigation:', request.url);
                        return false;
                    }}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView error: ', nativeEvent);
                        Alert.alert('Error', 'Failed to load payment page');
                    }}
                />
            )}
        </Modal>
    );



    return (
        <View style={styles.container}>
            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Additional Payment</Text>
            </Pressable>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {renderModalHeader()}

                        <ScrollView
                            style={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            bounces={false}>
                            {ADDITIONAL_FEES.map(renderFeeItem)}
                        </ScrollView>

                        {renderFooter()}
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {renderWebViewModal()}
        </View>
    );
}