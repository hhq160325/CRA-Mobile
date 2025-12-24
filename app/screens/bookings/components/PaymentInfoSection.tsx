import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { formatDate } from '../utils/bookingHelpers';

interface PaymentInfoSectionProps {
    invoice?: {
        amount?: number;
        status?: string;
    };
    totalPrice?: number;
    bookingDate: string;
    payments?: any[];
    bookingFee?: number;
}

export default function PaymentInfoSection({ invoice, totalPrice, bookingDate, payments, bookingFee: propBookingFee }: PaymentInfoSectionProps) {

    const bookingFeePayment = payments?.find(p => p.item === "Booking Fee");
    const bookingFee = propBookingFee || bookingFeePayment?.paidAmount || invoice?.amount || 0;


    const displayTotalPrice = bookingFee > 0 ? bookingFee : (totalPrice || 0);
    const hasBookingFee = bookingFee > 0;

    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="payment" size={24} color={colors.morentBlue} />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                    Payment
                </Text>
            </View>

            {/* Booking Fee */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: colors.placeholder }}>Booking Fee</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.morentBlue }}>
                    {displayTotalPrice.toLocaleString()} VND
                </Text>
            </View>

            {/* Payment Status - show from booking fee payment or invoice */}
            {(bookingFeePayment || invoice) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: colors.placeholder }}>Payment Status</Text>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: (bookingFeePayment?.status === 'Success' ||
                            bookingFeePayment?.status === 'Paid' ||
                            invoice?.status?.toLowerCase() === 'paid') ? '#00B050' : colors.placeholder
                    }}>
                        {bookingFeePayment?.status || invoice?.status || 'Pending'}
                    </Text>
                </View>
            )}

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border
            }}>
                <Text style={{ fontSize: 12, color: colors.placeholder }}>Booking Date</Text>
                <Text style={{ fontSize: 12, color: colors.placeholder }}>
                    {formatDate(bookingDate)}
                </Text>
            </View>
        </View>
    );
}
