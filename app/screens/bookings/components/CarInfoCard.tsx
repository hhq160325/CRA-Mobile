import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../../../theme/colors';

interface CarInfoCardProps {
    carImage: string;
    carName: string;
}

export default function CarInfoCard({ carImage, carName }: CarInfoCardProps) {
    return (
        <View style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16
        }}>
            <Image
                source={{ uri: carImage }}
                style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 8,
                    backgroundColor: colors.background
                }}
                resizeMode="cover"
            />
            <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 12, color: colors.primary }}>
                {carName || 'Car'}
            </Text>
        </View>
    );
}
