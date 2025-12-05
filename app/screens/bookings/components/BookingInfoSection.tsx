import React from 'react';
import { View, Text, Pressable, Alert, Clipboard } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';

interface BookingInfoSectionProps {
    bookingNumber?: string;
}

export default function BookingInfoSection({ bookingNumber }: BookingInfoSectionProps) {
    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="info" size={24} color={colors.morentBlue} />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                    Booking Information
                </Text>
            </View>

            {/* Booking ID (showing bookingNumber) */}
            <Pressable
                onPress={() => bookingNumber && copyToClipboard(bookingNumber, 'Booking ID')}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 8
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 4 }}>Booking ID</Text>
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                        {bookingNumber || 'N/A'}
                    </Text>
                </View>
                {bookingNumber && (
                    <MaterialIcons name="content-copy" size={20} color={colors.morentBlue} />
                )}
            </Pressable>
        </View>
    );
}
