import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';

interface CustomerInfoSectionProps {
    driverInfo: {
        name?: string;
        email?: string;
        phone?: string;
        licenseNumber?: string;
    };
}

export default function CustomerInfoSection({ driverInfo }: CustomerInfoSectionProps) {
    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="person" size={24} color={colors.morentBlue} />
                <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: colors.primary }}>
                    Customer Information
                </Text>
            </View>
            {driverInfo.name && (
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Name:</Text>
                    <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                        {driverInfo.name}
                    </Text>
                </View>
            )}
            {driverInfo.email && (
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Email:</Text>
                    <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                        {driverInfo.email}
                    </Text>
                </View>
            )}
            {driverInfo.phone && (
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>Phone:</Text>
                    <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                        {driverInfo.phone}
                    </Text>
                </View>
            )}
            {driverInfo.licenseNumber && (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, color: colors.placeholder, width: 80 }}>License:</Text>
                    <Text style={{ fontSize: 14, color: colors.primary, flex: 1 }}>
                        {driverInfo.licenseNumber}
                    </Text>
                </View>
            )}
        </View>
    );
}
