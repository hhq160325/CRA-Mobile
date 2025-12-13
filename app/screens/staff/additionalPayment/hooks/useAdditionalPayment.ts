import { useState } from 'react';
import { Alert } from 'react-native';
import {
    calculateTotal,
    buildPaymentDescription,
    createAdditionalPayment,
} from '../utils/paymentUtils';
import type { PaymentResponse } from '../types/additionalPaymentTypes';

export function useAdditionalPayment(
    bookingId: string,
    onPaymentAdded?: () => void
) {
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

    const adjustOvertimeHours = (increment: boolean) => {
        if (increment) {
            setOvertimeHours(prev => Math.min(5, prev + 1));
        } else {
            setOvertimeHours(prev => Math.max(1, prev - 1));
        }
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
            const description = buildPaymentDescription(selectedFees, overtimeHours);
            const totalAmount = calculateTotal(selectedFees, overtimeHours);

            const response = await createAdditionalPayment(bookingId, description, totalAmount);

            console.log('Payment response:', response);

            setPaymentResponse(response);
            setModalVisible(false);
            setShowWebView(true);

            onPaymentAdded?.();
        } catch (error) {
            console.error('Error creating additional payment:', error);
            Alert.alert('Error', 'Failed to add additional payment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getTotalAmount = () => calculateTotal(selectedFees, overtimeHours);

    return {

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
    };
}