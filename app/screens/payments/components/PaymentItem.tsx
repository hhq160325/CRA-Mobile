import React from 'react';
import { View, Text } from 'react-native';
import { formatDate, getStatusColor, getStatusBgColor } from '../utils/paymentUtils';
import { styles } from '../styles/paymentItem.styles';
import type { PaymentItem as PaymentItemType } from '../types/paymentTypes';

interface PaymentItemProps {
    payment: PaymentItemType;
    index: number;
    totalItems: number;
}

export default function PaymentItem({ payment, index, totalItems }: PaymentItemProps) {
    return (
        <View
            style={[
                styles.paymentItem,
                index < totalItems - 1 && styles.paymentItemWithBorder,
            ]}>
            <View style={styles.paymentHeader}>
                <View style={styles.paymentHeaderContent}>
                    <Text style={styles.paymentItemName}>{payment.item}</Text>
                    <Text style={styles.orderCode}>Order: {payment.orderCode}</Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(payment.status) },
                    ]}>
                    <Text
                        style={[
                            styles.statusText,
                            { color: getStatusColor(payment.status) },
                        ]}>
                        {payment.status}
                    </Text>
                </View>
            </View>

            <View style={styles.paymentFooter}>
                <View>
                    <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
                    <Text style={styles.paymentDate}>{formatDate(payment.createDate)}</Text>
                </View>
                <Text style={styles.paymentAmount}>
                    {payment.paidAmount.toLocaleString()} VND
                </Text>
            </View>
        </View>
    );
}