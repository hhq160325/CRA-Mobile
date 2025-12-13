import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { useAdditionalPayment } from '../additionalPayment/hooks/useAdditionalPayment';
import PaymentModal from '../additionalPayment/components/PaymentModal';
import PaymentWebView from '../additionalPayment/components/PaymentWebView';
import { styles } from '../styles/additionalPaymentSection.styles';
import type { AdditionalPaymentSectionProps } from '../additionalPayment/types/additionalPaymentTypes';

export default function AdditionalPaymentSection({
    bookingId,
    onPaymentAdded,
    onNavigateToReturn,
}: AdditionalPaymentSectionProps) {
    const {
        modalVisible,
        setModalVisible,
        selectedFees,
        overtimeHours,
        submitting,
        paymentResponse,
        showWebView,
        setShowWebView,
        toggleFee,
        adjustOvertimeHours,
        resetForm,
        handleSubmit,
        getTotalAmount,
    } = useAdditionalPayment(bookingId, onPaymentAdded);

    return (
        <View style={styles.container}>
            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Additional Payment</Text>
            </Pressable>

            <PaymentModal
                visible={modalVisible}
                selectedFees={selectedFees}
                overtimeHours={overtimeHours}
                submitting={submitting}
                totalAmount={getTotalAmount()}
                onClose={() => setModalVisible(false)}
                onToggleFee={toggleFee}
                onAdjustHours={adjustOvertimeHours}
                onSubmit={handleSubmit}
            />

            <PaymentWebView
                visible={showWebView}
                paymentResponse={paymentResponse}
                onClose={() => setShowWebView(false)}
                onReset={resetForm}
                onNavigateToReturn={onNavigateToReturn}
            />
        </View>
    );
}