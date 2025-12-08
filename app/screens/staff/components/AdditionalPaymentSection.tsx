import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';

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

interface AdditionalPaymentSectionProps {
    bookingId: string;
    onPaymentAdded?: () => void;
}

export default function AdditionalPaymentSection({
    bookingId,
    onPaymentAdded,
}: AdditionalPaymentSectionProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);
    const [overtimeHours, setOvertimeHours] = useState(1);
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = async () => {
        if (selectedFees.length === 0) {
            Alert.alert('Error', 'Please select at least one fee.');
            return;
        }

        setSubmitting(true);

        try {
            const descriptions = selectedFees
                .map(feeId => {
                    const fee = ADDITIONAL_FEES.find(f => f.id === feeId);
                    if (feeId === 'overtime') {
                        return `${fee?.name} (${overtimeHours}h)`;
                    }
                    return fee?.name;
                })
                .join(', ');

            const totalAmount = calculateTotal();

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
                        description: descriptions,
                        amount: totalAmount,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to create additional payment');
            }

            Alert.alert('Success', 'Additional payment added successfully!');
            setModalVisible(false);
            setSelectedFees([]);
            setOvertimeHours(1);
            onPaymentAdded?.();
        } catch (error) {
            Alert.alert('Error', 'Failed to add additional payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Additional Fees</Text>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <MaterialIcons name="close" size={24} color="#6b7280" />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            bounces={false}>
                            {ADDITIONAL_FEES.map(fee => (
                                <Pressable
                                    key={fee.id}
                                    style={[
                                        styles.feeItem,
                                        selectedFees.includes(fee.id) && styles.feeItemSelected,
                                    ]}
                                    onPress={() => toggleFee(fee.id)}>
                                    <View style={styles.feeHeader}>
                                        <View style={styles.feeIconContainer}>
                                            <MaterialIcons
                                                name={fee.icon as any}
                                                size={22}
                                                color={
                                                    selectedFees.includes(fee.id)
                                                        ? colors.morentBlue
                                                        : '#6b7280'
                                                }
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
                                            name={
                                                selectedFees.includes(fee.id)
                                                    ? 'check-box'
                                                    : 'check-box-outline-blank'
                                            }
                                            size={22}
                                            color={
                                                selectedFees.includes(fee.id)
                                                    ? colors.morentBlue
                                                    : '#d1d5db'
                                            }
                                        />
                                    </View>
                                    <Text style={styles.feeDescription}>{fee.description}</Text>

                                    {fee.id === 'overtime' && selectedFees.includes('overtime') && (
                                        <View style={styles.hoursSelector}>
                                            <Text style={styles.hoursLabel}>Hours:</Text>
                                            <Pressable
                                                style={styles.hoursButton}
                                                onPress={() =>
                                                    setOvertimeHours(Math.max(1, overtimeHours - 1))
                                                }>
                                                <MaterialIcons
                                                    name="remove"
                                                    size={18}
                                                    color={colors.morentBlue}
                                                />
                                            </Pressable>
                                            <Text style={styles.hoursValue}>{overtimeHours}</Text>
                                            <Pressable
                                                style={styles.hoursButton}
                                                onPress={() =>
                                                    setOvertimeHours(Math.min(5, overtimeHours + 1))
                                                }>
                                                <MaterialIcons
                                                    name="add"
                                                    size={18}
                                                    color={colors.morentBlue}
                                                />
                                            </Pressable>
                                        </View>
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>

                        <View style={styles.footer}>
                            <View style={styles.totalSection}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalAmount}>
                                    {formatCurrency(calculateTotal())}
                                </Text>
                            </View>

                            <Pressable
                                style={[
                                    styles.submitButton,
                                    (submitting || selectedFees.length === 0) &&
                                    styles.submitButtonDisabled,
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
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(12),
    },
    addButton: {
        backgroundColor: '#f59e0b',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    addButtonText: {
        color: colors.white,
        fontSize: scale(15),
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: scale(16),
        borderTopRightRadius: scale(16),
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#1f2937',
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        maxHeight: verticalScale(300),
    },
    feeItem: {
        backgroundColor: '#f9fafb',
        borderRadius: scale(10),
        padding: scale(12),
        marginVertical: verticalScale(6),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    feeItemSelected: {
        borderColor: colors.morentBlue,
        backgroundColor: '#eff6ff',
    },
    feeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    feeIconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    feeInfo: {
        flex: 1,
    },
    feeName: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#1f2937',
    },
    feeAmount: {
        fontSize: scale(13),
        color: '#ef4444',
        fontWeight: '500',
    },
    feeDescription: {
        fontSize: scale(12),
        color: '#6b7280',
        lineHeight: scale(16),
    },
    hoursSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
        paddingTop: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    hoursLabel: {
        fontSize: scale(13),
        color: '#374151',
        marginRight: scale(10),
    },
    hoursButton: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hoursValue: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#1f2937',
        marginHorizontal: scale(12),
    },
    footer: {
        padding: scale(16),
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    totalLabel: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#1f2937',
    },
    totalAmount: {
        fontSize: scale(18),
        fontWeight: '700',
        color: '#ef4444',
    },
    submitButton: {
        backgroundColor: colors.morentBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
        gap: scale(8),
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: scale(15),
        fontWeight: '600',
    },
});
