import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';
import { getStatusColor, getStatusText } from '../utils/bookingHelpers';

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center'
        }}>
            <View style={{
                backgroundColor: getStatusColor(status),
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20
            }}>
                <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                    {getStatusText(status)}
                </Text>
            </View>
        </View>
    );
}
