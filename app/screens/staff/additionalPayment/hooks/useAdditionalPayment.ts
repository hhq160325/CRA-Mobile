import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { type CarTravelLog } from '../../../../../lib/api';
import {
    calculateTotal,
    buildPaymentDescription,
    createAdditionalPayment,
} from '../utils/paymentUtils';
import type { PaymentResponse } from '../types/additionalPaymentTypes';

export function useAdditionalPayment(
    bookingId: string,
    onPaymentAdded?: () => void,
    travelLogs?: CarTravelLog[]
) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);
    const [overtimeHours, setOvertimeHours] = useState(1);
    const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
    const [showWebView, setShowWebView] = useState(false);


    const getTravelLogsTotal = () => {
        if (!travelLogs || travelLogs.length === 0) return 0;
        return travelLogs.reduce((total, log) => total + log.chargeAmount, 0);
    };


    useEffect(() => {
        const travelLogsTotal = getTravelLogsTotal();
        if (travelLogsTotal > 0) {
            setCustomAmounts(prev => ({
                ...prev,
                total_charges: travelLogsTotal,
            }));

            if (!selectedFees.includes('total_charges')) {
                setSelectedFees(prev => [...prev, 'total_charges']);
            }
        }
    }, [travelLogs]);

    const toggleFee = (feeId: string) => {
        setSelectedFees(prev =>
            prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId],
        );
    };

    const setCustomAmount = (feeId: string, amount: number) => {
        setCustomAmounts(prev => ({
            ...prev,
            [feeId]: amount,
        }));
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
        setCustomAmounts({});
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
            const description = buildPaymentDescription(selectedFees, overtimeHours, customAmounts);
            const totalAmount = calculateTotal(selectedFees, overtimeHours, customAmounts);

            // console.log(' Starting additional payment creation...');
            // console.log(' Booking ID:', bookingId);
            // console.log(' Description:', description);
            // console.log(' Total Amount:', totalAmount);
            const response = await createAdditionalPayment(bookingId, description, totalAmount);

            console.log(' Payment response received:', response);

            setPaymentResponse(response);
            setModalVisible(false);
            setShowWebView(true);

            onPaymentAdded?.();
        } catch (error) {
            console.error(' Error creating additional payment:', error);

            // Show more specific error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            Alert.alert(
                'Error',
                `Failed to add additional payment.\n\nDetails: ${errorMessage}\n\nPlease try again or contact support.`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const getTotalAmount = () => calculateTotal(selectedFees, overtimeHours, customAmounts);

    return {

        modalVisible,
        setModalVisible,
        selectedFees,
        overtimeHours,
        customAmounts,
        submitting,
        paymentResponse,
        showWebView,
        setShowWebView,
        toggleFee,
        setCustomAmount,
        adjustOvertimeHours,
        resetForm,
        handleSubmit,
        getTotalAmount,
    };
}