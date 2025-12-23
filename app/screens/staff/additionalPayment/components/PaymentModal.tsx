import React from 'react';
import {
    View,
    Text,
    Pressable,
    Modal,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../theme/colors';
import { formatCurrency } from '../utils/paymentUtils';
import { ADDITIONAL_FEES } from '../constants/additionalFees';
import FeeItem from './FeeItem';
import { styles } from '../../styles/additionalPaymentSection.styles';

interface PaymentModalProps {
    visible: boolean;
    selectedFees: string[];
    overtimeHours: number;
    submitting: boolean;
    totalAmount: number;
    onClose: () => void;
    onToggleFee: (feeId: string) => void;
    onAdjustHours: (increment: boolean) => void;
    onSubmit: () => void;
}

export default function PaymentModal({
    visible,
    selectedFees,
    overtimeHours,
    submitting,
    totalAmount,
    onClose,
    onToggleFee,
    onAdjustHours,
    onSubmit
}: PaymentModalProps) {
    const renderModalHeader = () => (
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Additional Fees</Text>
            <Pressable
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
            </View>

            <Pressable
                style={[
                    styles.submitButton,
                    (submitting || selectedFees.length === 0) && styles.submitButtonDisabled,
                ]}
                onPress={onSubmit}
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
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {renderModalHeader()}

                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}>
                        {ADDITIONAL_FEES.map(fee => (
                            <FeeItem
                                key={fee.id}
                                fee={fee}
                                isSelected={selectedFees.includes(fee.id)}
                                overtimeHours={overtimeHours}
                                onToggle={onToggleFee}
                                onAdjustHours={onAdjustHours}
                            />
                        ))}
                    </ScrollView>

                    {renderFooter()}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}