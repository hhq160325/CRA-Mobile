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

    const createAdditionalPayment = async (description: string, amount: number) => {
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

        return response;
    };

    const resetForm = () => {
        setModalVisible(false);
        setSelectedFees([]);
        setOvertimeHours(1);
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

            await createAdditionalPayment(description, totalAmount);

            Alert.alert('Success', 'Additional payment added successfully!');
            resetForm();
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
        </View>
    );
}