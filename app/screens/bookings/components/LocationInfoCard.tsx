import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { formatDate } from '../utils/bookingHelpers';

interface LocationInfoCardProps {
    title: string;
    iconName: string;
    location: string;
    date: string;
}

export default function LocationInfoCard({ title, iconName, location, date }: LocationInfoCardProps) {
    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name={iconName as any} size={24} color={colors.morentBlue} />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                    {title}
                </Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.primary, marginBottom: 4 }}>
                {location || 'N/A'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.placeholder }}>
                {formatDate(date)}
            </Text>
        </View>
    );
}
